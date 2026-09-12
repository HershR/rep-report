import { addDays, setHours, setMinutes, setSeconds, startOfWeek, subWeeks } from "date-fns";

import type { SetType } from "@/db/schema";
import type { DemoExerciseKey } from "@/db/devSeed/exercises";
import { toMetricHeight, toMetricWeight } from "@/lib/units";

/**
 * Builds the entire demo dataset as plain data — no database access, no
 * `Date.now()` beyond the `now` passed in. Everything is resolved here so the
 * write side can run inside drizzle's *synchronous* transaction without
 * awaiting anything (see the note in `index.ts`).
 */

// -- deterministic randomness ------------------------------------------------

/** mulberry32: tiny, seedable, good enough for jitter. */
function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const chance = (rng: () => number, probability: number) => rng() < probability;

const intBetween = (rng: () => number, low: number, high: number) =>
  low + Math.floor(rng() * (high - low + 1));

/**
 * Fixed so a re-seed on the same day reproduces the same numbers. The RNG is
 * drawn in a fixed traversal order (week → session → exercise → set), so
 * changing that order changes the whole dataset.
 */
const DEMO_SEED = 0x52455021;

// -- progression ------------------------------------------------------------

type ProgressionSpec = {
  key: DemoExerciseKey;
  /** Week-one working weight, in lb — converted to kg at the end. */
  startLb: number;
  /** Added per productive week. Deload and off weeks do not advance it. */
  weeklyGainLb: number;
  /** Plate or stack granularity. Every result snaps to a multiple of this. */
  incrementLb: number;
  workingSets: number;
  repRange: [min: number, max: number];
  warmupSets: number;
  restSeconds: number;
};

const UPPER_BODY: ProgressionSpec[] = [
  { key: "benchPress", startLb: 135, weeklyGainLb: 5, incrementLb: 5, workingSets: 4, repRange: [6, 8], warmupSets: 1, restSeconds: 150 },
  { key: "inclineBenchPress", startLb: 95, weeklyGainLb: 5, incrementLb: 5, workingSets: 3, repRange: [8, 10], warmupSets: 0, restSeconds: 120 },
  { key: "shoulderPress", startLb: 75, weeklyGainLb: 2.5, incrementLb: 5, workingSets: 3, repRange: [8, 10], warmupSets: 0, restSeconds: 120 },
  { key: "latPulldown", startLb: 100, weeklyGainLb: 5, incrementLb: 10, workingSets: 3, repRange: [8, 12], warmupSets: 0, restSeconds: 105 },
  { key: "barbellCurl", startLb: 50, weeklyGainLb: 2.5, incrementLb: 5, workingSets: 3, repRange: [10, 12], warmupSets: 0, restSeconds: 90 },
  { key: "tricepsPushdown", startLb: 40, weeklyGainLb: 2.5, incrementLb: 5, workingSets: 3, repRange: [10, 12], warmupSets: 0, restSeconds: 90 },
];

const LOWER_BODY: ProgressionSpec[] = [
  { key: "squat", startLb: 185, weeklyGainLb: 10, incrementLb: 5, workingSets: 4, repRange: [5, 8], warmupSets: 1, restSeconds: 180 },
  { key: "deadlift", startLb: 225, weeklyGainLb: 10, incrementLb: 5, workingSets: 3, repRange: [5, 5], warmupSets: 1, restSeconds: 210 },
  { key: "legPress", startLb: 270, weeklyGainLb: 10, incrementLb: 10, workingSets: 3, repRange: [10, 12], warmupSets: 0, restSeconds: 120 },
  { key: "legCurl", startLb: 70, weeklyGainLb: 5, incrementLb: 10, workingSets: 3, repRange: [10, 12], warmupSets: 0, restSeconds: 90 },
  { key: "calfRaise", startLb: 90, weeklyGainLb: 5, incrementLb: 5, workingSets: 4, repRange: [12, 15], warmupSets: 0, restSeconds: 75 },
];

type WeekKind = "build" | "deload" | "off" | "peak";

/** Eight weeks ending in the current one. `sessions` stays within 0-3. */
const WEEK_PLAN: { sessions: number; kind: WeekKind }[] = [
  { sessions: 2, kind: "build" }, // easing in
  { sessions: 3, kind: "build" },
  { sessions: 3, kind: "build" },
  { sessions: 2, kind: "deload" }, // planned back-off
  { sessions: 3, kind: "build" },
  { sessions: 0, kind: "off" }, // a week away from the gym
  { sessions: 3, kind: "build" },
  { sessions: 3, kind: "peak" }, // current week — the PRs land here
];

const KIND_MULTIPLIER: Record<WeekKind, number> = {
  build: 1,
  deload: 0.9,
  off: 0.95,
  peak: 1.05,
};

/** ISO weekday numbers (1 = Monday) for a week with n sessions. */
const DAY_PATTERNS: Record<number, number[]> = {
  0: [],
  1: [3],
  2: [2, 5],
  3: [1, 3, 5],
};

const TEMPLATES = [
  { id: "demo-tpl-upper", name: "Upper Body", description: "Push, pull and arms.", specs: UPPER_BODY },
  { id: "demo-tpl-lower", name: "Lower Body", description: "Squat, hinge and accessories.", specs: LOWER_BODY },
] as const;

/** Body weight in lb, one reading per week. Dips with the deload. */
const BODY_WEIGHT_LB = [178, 179, 180, 179, 181, 181, 182, 183];
const HEIGHT_IN = 70;

// -- plan shapes ------------------------------------------------------------

export type DemoSetPlan = {
  id: string;
  orderIndex: number;
  reps: number;
  weightKg: number;
  setType: SetType;
};

export type DemoSessionPlan = {
  id: string;
  templateId: string;
  name: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  exercises: {
    id: string;
    key: DemoExerciseKey;
    orderIndex: number;
    sets: DemoSetPlan[];
  }[];
};

export type DemoTemplatePlan = {
  id: string;
  name: string;
  description: string;
  exercises: {
    id: string;
    key: DemoExerciseKey;
    orderIndex: number;
    sets: {
      id: string;
      orderIndex: number;
      targetReps: number;
      targetWeightKg: number;
      setType: SetType;
    }[];
  }[];
};

export type DemoMeasurementPlan = {
  id: string;
  measurementType: "weight" | "height";
  value: number;
  unit: "kg" | "cm";
  measuredAt: string;
};

export type DemoPlan = {
  templates: DemoTemplatePlan[];
  sessions: DemoSessionPlan[];
  measurements: DemoMeasurementPlan[];
};

// -- generation -------------------------------------------------------------

const pad = (value: number) => String(value).padStart(2, "0");

const snap = (lb: number, incrementLb: number) =>
  Math.round(lb / incrementLb) * incrementLb;

/** Only build and peak weeks move the working weight forward. */
function productiveWeeksBefore(weekIndex: number): number {
  return WEEK_PLAN.slice(0, weekIndex).filter(
    (week) => week.kind === "build" || week.kind === "peak",
  ).length;
}

function workingWeightLb(
  spec: ProgressionSpec,
  weekIndex: number,
  kind: WeekKind,
  isBadSession: boolean,
): number {
  const base = spec.startLb + spec.weeklyGainLb * productiveWeeksBefore(weekIndex);
  const adjusted =
    base * KIND_MULTIPLIER[kind] - (isBadSession ? spec.incrementLb : 0);
  return Math.max(spec.incrementLb, snap(adjusted, spec.incrementLb));
}

function setReps(
  spec: ProgressionSpec,
  setIndex: number,
  isBadSession: boolean,
  isPeakTopSet: boolean,
  rng: () => number,
): number {
  const [min, max] = spec.repRange;
  if (isPeakTopSet) return max;
  const fatigue = Math.floor(setIndex / 2);
  const wobble = chance(rng, 0.3) ? -1 : 0;
  return Math.max(min, max - fatigue + wobble - (isBadSession ? 1 : 0));
}

/**
 * 17:30 or 18:30 *local*. Deliberately mid-evening: history reads compare
 * `completedAt` against local day boundaries, so a timestamp near midnight
 * would land on a different calendar day depending on the device's timezone.
 */
function sessionTime(day: Date, indexInWeek: number): Date {
  return setSeconds(setMinutes(setHours(day, 17 + (indexInWeek % 2)), 30), 0);
}

/**
 * Targets come from the most recent session that trained the exercise, so
 * starting a workout from a template prefills what you actually lifted last
 * time rather than where the eight weeks began.
 */
function buildTemplates(sessions: DemoSessionPlan[]): DemoTemplatePlan[] {
  const latestWorkingSet = new Map<DemoExerciseKey, DemoSetPlan>();
  for (const session of sessions) {
    for (const exercise of session.exercises) {
      const working = exercise.sets.find((set) => set.setType === "normal");
      if (working) latestWorkingSet.set(exercise.key, working);
    }
  }

  return TEMPLATES.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    exercises: template.specs.map((spec, exerciseIndex) => {
      const exerciseId = `${template.id}-ex-${exerciseIndex}`;
      const latest = latestWorkingSet.get(spec.key);
      const targetWeightKg =
        latest?.weightKg ?? toMetricWeight(spec.startLb, "lb");
      return {
        id: exerciseId,
        key: spec.key,
        orderIndex: exerciseIndex,
        sets: Array.from({ length: spec.workingSets }, (_, setIndex) => ({
          id: `${exerciseId}-set-${setIndex}`,
          orderIndex: setIndex,
          targetReps: latest?.reps ?? spec.repRange[1],
          targetWeightKg,
          setType: "normal" as SetType,
        })),
      };
    }),
  }));
}

function buildSessions(now: Date, rng: () => number): DemoSessionPlan[] {
  const currentMonday = startOfWeek(now, { weekStartsOn: 1 });
  const sessions: DemoSessionPlan[] = [];
  let ordinal = 0;

  WEEK_PLAN.forEach((week, weekIndex) => {
    const monday = subWeeks(currentMonday, WEEK_PLAN.length - 1 - weekIndex);

    DAY_PATTERNS[week.sessions].forEach((isoWeekday, indexInWeek) => {
      const completedAt = sessionTime(addDays(monday, isoWeekday - 1), indexInWeek);
      // The last week is the current one, so its later days may not have
      // happened yet. Leaving them out is what makes this week look partial.
      if (completedAt > now) return;

      const template = TEMPLATES[ordinal % TEMPLATES.length];
      const sessionId = `demo-session-${pad(ordinal)}`;
      const isBadSession = week.kind !== "peak" && chance(rng, 0.12);
      let restTotal = 0;

      const exercises = template.specs.map((spec, exerciseIndex) => {
        const exerciseId = `${sessionId}-ex-${exerciseIndex}`;
        const weightLb = workingWeightLb(spec, weekIndex, week.kind, isBadSession);
        const sets: DemoSetPlan[] = [];

        for (let index = 0; index < spec.warmupSets; index += 1) {
          sets.push({
            id: `${exerciseId}-set-${sets.length}`,
            orderIndex: sets.length,
            reps: 10,
            weightKg: toMetricWeight(snap(weightLb * 0.55, spec.incrementLb), "lb"),
            setType: "warmup",
          });
        }

        for (let index = 0; index < spec.workingSets; index += 1) {
          const isPeakTopSet = week.kind === "peak" && index === 0;
          sets.push({
            id: `${exerciseId}-set-${sets.length}`,
            orderIndex: sets.length,
            reps: setReps(spec, index, isBadSession, isPeakTopSet, rng),
            weightKg: toMetricWeight(weightLb, "lb"),
            setType: "normal",
          });
        }

        restTotal += sets.length * spec.restSeconds;
        return { id: exerciseId, key: spec.key, orderIndex: exerciseIndex, sets };
      });

      const durationSeconds = Math.max(
        600,
        restTotal + exercises.length * 120 + intBetween(rng, -300, 300),
      );

      sessions.push({
        id: sessionId,
        templateId: template.id,
        name: template.name,
        startedAt: new Date(completedAt.getTime() - durationSeconds * 1000).toISOString(),
        completedAt: completedAt.toISOString(),
        durationSeconds,
        exercises,
      });

      ordinal += 1;
    });
  });

  return sessions;
}

function buildMeasurements(now: Date): DemoMeasurementPlan[] {
  const currentMonday = startOfWeek(now, { weekStartsOn: 1 });
  const morningOfWeek = (weekIndex: number) =>
    setSeconds(
      setMinutes(
        setHours(subWeeks(currentMonday, WEEK_PLAN.length - 1 - weekIndex), 8),
        0,
      ),
      0,
    );

  const measurements: DemoMeasurementPlan[] = [];

  BODY_WEIGHT_LB.forEach((lb, weekIndex) => {
    const measuredAt = morningOfWeek(weekIndex);
    if (measuredAt > now) return;
    measurements.push({
      id: `demo-weight-${pad(weekIndex)}`,
      measurementType: "weight",
      value: toMetricWeight(lb, "lb"),
      unit: "kg",
      measuredAt: measuredAt.toISOString(),
    });
  });

  // Height doesn't change, but the history screen and its chart need more than
  // one point to render anything, so record it at both ends of the window.
  [0, WEEK_PLAN.length - 2].forEach((weekIndex, index) => {
    measurements.push({
      id: `demo-height-${pad(index)}`,
      measurementType: "height",
      value: toMetricHeight(HEIGHT_IN, "in"),
      unit: "cm",
      measuredAt: morningOfWeek(weekIndex).toISOString(),
    });
  });

  return measurements;
}

export function buildDemoPlan(now: Date): DemoPlan {
  const rng = createRng(DEMO_SEED);
  const sessions = buildSessions(now, rng);
  return {
    templates: buildTemplates(sessions),
    sessions,
    measurements: buildMeasurements(now),
  };
}
