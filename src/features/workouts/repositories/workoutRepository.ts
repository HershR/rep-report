import { and, asc, desc, eq, gte, inArray, lte, ne } from "drizzle-orm";
import { format, startOfWeek, subWeeks } from "date-fns";

import { db } from "@/db/client";
import { chunk, createUuid, nowUtc } from "@/db/utils";
import {
  type SetType,
  exercises,
  workoutTemplateExercises,
  workoutTemplateSets,
  workoutSessionExercises,
  workoutSessions,
  workoutSets,
  type WorkoutSession,
} from "@/db/schema";
import type { Exercise } from "@/features/exercises/types";
import type { WorkoutSessionDetails, WorkoutSessionExerciseWithDetails } from "@/features/workouts/types";

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function toExercise(row: typeof exercises.$inferSelect): Exercise {
  return {
    id: row.id,
    wgerExerciseId: row.wgerExerciseId,
    name: row.name,
    description: row.description,
    category: row.category,
    equipment: parseJsonArray(row.equipment),
    primaryMuscles: parseJsonArray(row.primaryMuscles),
    secondaryMuscles: parseJsonArray(row.secondaryMuscles),
    imageUrl: row.imageUrl,
    source: row.source,
    isFavorite: row.isFavorite === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function hydrateWorkoutSession(sessionId: string): Promise<WorkoutSessionDetails | null> {
  const [session] = await db.select().from(workoutSessions).where(eq(workoutSessions.id, sessionId)).limit(1);
  if (!session) return null;

  const sessionExerciseRows = await db
    .select()
    .from(workoutSessionExercises)
    .where(eq(workoutSessionExercises.workoutSessionId, sessionId))
    .orderBy(asc(workoutSessionExercises.orderIndex));

  if (sessionExerciseRows.length === 0) {
    return { ...session, exercises: [] };
  }

  const exerciseRows = await db
    .select()
    .from(exercises)
    .where(
      inArray(
        exercises.id,
        sessionExerciseRows.map((row) => row.exerciseId),
      ),
    );

  const setRows = await db
    .select()
    .from(workoutSets)
    .where(
      inArray(
        workoutSets.workoutSessionExerciseId,
        sessionExerciseRows.map((row) => row.id),
      ),
    )
    .orderBy(asc(workoutSets.orderIndex));

  const exerciseMap = new Map(exerciseRows.map((row) => [row.id, toExercise(row)]));
  const setsBySessionExerciseId = new Map<string, typeof setRows>();
  for (const set of setRows) {
    const list = setsBySessionExerciseId.get(set.workoutSessionExerciseId) ?? [];
    list.push(set);
    setsBySessionExerciseId.set(set.workoutSessionExerciseId, list);
  }

  const hydratedExercises: WorkoutSessionExerciseWithDetails[] = sessionExerciseRows
    .map((sessionExercise) => {
      const exercise = exerciseMap.get(sessionExercise.exerciseId);
      if (!exercise) return null;
      return {
        ...sessionExercise,
        exercise,
        sets: setsBySessionExerciseId.get(sessionExercise.id) ?? [],
      };
    })
    .filter((item): item is WorkoutSessionExerciseWithDetails => Boolean(item));

  return {
    ...session,
    exercises: hydratedExercises,
  };
}

async function getNextExerciseOrderIndex(workoutSessionId: string): Promise<number> {
  const rows = await db
    .select({ orderIndex: workoutSessionExercises.orderIndex })
    .from(workoutSessionExercises)
    .where(eq(workoutSessionExercises.workoutSessionId, workoutSessionId))
    .orderBy(desc(workoutSessionExercises.orderIndex))
    .limit(1);
  return (rows[0]?.orderIndex ?? -1) + 1;
}

async function getNextSetOrderIndex(workoutSessionExerciseId: string): Promise<number> {
  const rows = await db
    .select({ orderIndex: workoutSets.orderIndex })
    .from(workoutSets)
    .where(eq(workoutSets.workoutSessionExerciseId, workoutSessionExerciseId))
    .orderBy(desc(workoutSets.orderIndex))
    .limit(1);
  return (rows[0]?.orderIndex ?? -1) + 1;
}

/** The exercises and sets a new session starts with, already in order. */
type SessionSeed = {
  exerciseId: string;
  orderIndex: number;
  notes: string | null;
  sets: {
    orderIndex: number;
    reps: number | null;
    weight: number | null;
    durationSeconds: number | null;
    distance: number | null;
    setType: SetType;
  }[];
}[];

function groupBy<T, K>(rows: T[], key: (row: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const row of rows) {
    const list = groups.get(key(row)) ?? [];
    list.push(row);
    groups.set(key(row), list);
  }
  return groups;
}

async function loadTemplateSeed(templateId: string): Promise<SessionSeed> {
  const exerciseRows = await db
    .select()
    .from(workoutTemplateExercises)
    .where(eq(workoutTemplateExercises.templateId, templateId))
    .orderBy(asc(workoutTemplateExercises.orderIndex));
  if (exerciseRows.length === 0) return [];

  const setRows = await db
    .select()
    .from(workoutTemplateSets)
    .where(
      inArray(
        workoutTemplateSets.templateExerciseId,
        exerciseRows.map((row) => row.id),
      ),
    )
    .orderBy(asc(workoutTemplateSets.orderIndex));
  const setsByExercise = groupBy(setRows, (row) => row.templateExerciseId);

  return exerciseRows.map((row) => ({
    exerciseId: row.exerciseId,
    orderIndex: row.orderIndex,
    notes: row.notes,
    sets: (setsByExercise.get(row.id) ?? []).map((set) => ({
      orderIndex: set.orderIndex,
      reps: set.targetReps,
      weight: set.targetWeight,
      durationSeconds: set.targetDurationSeconds,
      distance: set.targetDistance,
      setType: set.setType,
    })),
  }));
}

async function loadSessionSeed(sessionId: string): Promise<SessionSeed> {
  const exerciseRows = await db
    .select()
    .from(workoutSessionExercises)
    .where(eq(workoutSessionExercises.workoutSessionId, sessionId))
    .orderBy(asc(workoutSessionExercises.orderIndex));
  if (exerciseRows.length === 0) return [];

  const setRows = await db
    .select()
    .from(workoutSets)
    .where(
      inArray(
        workoutSets.workoutSessionExerciseId,
        exerciseRows.map((row) => row.id),
      ),
    )
    .orderBy(asc(workoutSets.orderIndex));
  const setsByExercise = groupBy(setRows, (row) => row.workoutSessionExerciseId);

  return exerciseRows.map((row) => ({
    exerciseId: row.exerciseId,
    orderIndex: row.orderIndex,
    notes: row.notes,
    sets: (setsByExercise.get(row.id) ?? []).map((set) => ({
      orderIndex: set.orderIndex,
      reps: set.reps,
      weight: set.weight,
      durationSeconds: set.durationSeconds,
      distance: set.distance,
      setType: set.setType,
    })),
  }));
}

/**
 * Creates the in-progress session and everything it starts with, in one
 * transaction - so a crash or a throw can never leave a half-copied template
 * behind as the live workout. Does nothing if a session is already in progress.
 *
 * `db.transaction` on expo-sqlite is SYNCHRONOUS: it commits the moment this
 * callback returns, and an async callback would commit before its statements
 * ran, with no error. So everything inside is `.get()`/`.run()`, nothing
 * awaits, and callers do their async reads first and hand in plain rows.
 */
function insertActiveSession(input: {
  name: string;
  templateId: string | null;
  notes: string | null;
  seed: SessionSeed;
}): void {
  const sessionId = createUuid();
  const timestamp = nowUtc();

  const exerciseRows: (typeof workoutSessionExercises.$inferInsert)[] = [];
  const setRows: (typeof workoutSets.$inferInsert)[] = [];
  for (const exercise of input.seed) {
    const sessionExerciseId = createUuid();
    exerciseRows.push({
      id: sessionExerciseId,
      workoutSessionId: sessionId,
      exerciseId: exercise.exerciseId,
      orderIndex: exercise.orderIndex,
      notes: exercise.notes,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    for (const set of exercise.sets) {
      setRows.push({
        id: createUuid(),
        workoutSessionExerciseId: sessionExerciseId,
        ...set,
        isCompleted: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }
  }

  db.transaction((tx) => {
    // Re-checked inside the transaction; the partial unique index on `status`
    // is the backstop if anything slips between this and the insert.
    const existing = tx
      .select({ id: workoutSessions.id })
      .from(workoutSessions)
      .where(eq(workoutSessions.status, "active"))
      .get();
    if (existing) return;

    tx.insert(workoutSessions)
      .values({
        id: sessionId,
        templateId: input.templateId,
        name: input.name,
        startedAt: timestamp,
        completedAt: null,
        durationSeconds: null,
        notes: input.notes,
        status: "active",
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .run();
    for (const batch of chunk(exerciseRows)) {
      tx.insert(workoutSessionExercises).values(batch).run();
    }
    for (const batch of chunk(setRows)) {
      tx.insert(workoutSets).values(batch).run();
    }
  });
}

async function requireActiveSession(): Promise<WorkoutSessionDetails> {
  const session = await getActiveWorkoutSession();
  if (!session) throw new Error("Failed to start workout");
  return session;
}

export async function getWorkoutSessionById(id: string): Promise<WorkoutSession | null> {
  const [row] = await db.select().from(workoutSessions).where(eq(workoutSessions.id, id)).limit(1);
  return row ?? null;
}

export async function getCompletedWorkoutsByDate(date: string): Promise<WorkoutSessionDetails[]> {
  const startLocal = new Date(`${date}T00:00:00`);
  const endLocal = new Date(`${date}T23:59:59.999`);
  const startUtcIso = startLocal.toISOString();
  const endUtcIso = endLocal.toISOString();

  // ISO-UTC strings sort chronologically, so the range runs in SQL on the
  // `completed_at` index.
  const rows = await db
    .select({ id: workoutSessions.id })
    .from(workoutSessions)
    .where(
      and(
        eq(workoutSessions.status, "completed"),
        gte(workoutSessions.completedAt, startUtcIso),
        lte(workoutSessions.completedAt, endUtcIso),
      ),
    )
    .orderBy(desc(workoutSessions.completedAt));

  const hydrated = await Promise.all(rows.map((row) => hydrateWorkoutSession(row.id)));
  return hydrated.filter((row): row is WorkoutSessionDetails => Boolean(row));
}

export type WorkoutDailyTotal = {
  dateKey: string;
  exerciseCount: number;
  sessionCount: number;
};

export async function getCompletedWorkoutDailyTotals(): Promise<WorkoutDailyTotal[]> {
  const sessions = await db
    .select({
      id: workoutSessions.id,
      completedAt: workoutSessions.completedAt,
    })
    .from(workoutSessions)
    .where(eq(workoutSessions.status, "completed"));

  if (sessions.length === 0) return [];

  const exerciseRows = await db
    .select({ workoutSessionId: workoutSessionExercises.workoutSessionId })
    .from(workoutSessionExercises)
    .where(
      inArray(
        workoutSessionExercises.workoutSessionId,
        sessions.map((session) => session.id),
      ),
    );

  const exerciseCountBySession = new Map<string, number>();
  for (const row of exerciseRows) {
    exerciseCountBySession.set(
      row.workoutSessionId,
      (exerciseCountBySession.get(row.workoutSessionId) ?? 0) + 1,
    );
  }

  const totalsByDay = new Map<string, WorkoutDailyTotal>();
  for (const session of sessions) {
    if (!session.completedAt) continue;
    // Map each session's UTC completedAt back to the user's local calendar day
    // (inverse of useWorkoutHistory's toDateKey) so days match what a user sees.
    const dateKey = format(new Date(session.completedAt), "yyyy-MM-dd");
    const sessionExerciseCount = exerciseCountBySession.get(session.id) ?? 0;
    const existing = totalsByDay.get(dateKey);
    if (existing) {
      existing.exerciseCount += sessionExerciseCount;
      existing.sessionCount += 1;
    } else {
      totalsByDay.set(dateKey, {
        dateKey,
        exerciseCount: sessionExerciseCount,
        sessionCount: 1,
      });
    }
  }

  return [...totalsByDay.values()];
}

export type WeeklyProgress = {
  /** Active seconds per weekday, Monday first - drives the week strip. */
  dailySeconds: number[];
  /** Completed workouts since Monday. */
  sessionCount: number;
  /** Completed workouts in the week before, for the week-over-week delta. */
  previousSessionCount: number;
  /** Total workout duration (seconds) since Monday. */
  activitySeconds: number;
};

/**
 * Totals for the current week (Monday-start, local time). `completedAt` is a
 * UTC ISO instant, so comparing against the local Monday-midnight instant
 * (`startOfWeek(..., { weekStartsOn: 1 }).toISOString()`) correctly scopes to
 * "this week" — ISO-UTC strings sort chronologically, so a string compare works.
 */
export async function getCurrentWeekProgress(): Promise<WeeklyProgress> {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekStartIso = weekStart.toISOString();
  const previousWeekStartIso = subWeeks(weekStart, 1).toISOString();

  const sessionRows = await db
    .select({
      id: workoutSessions.id,
      completedAt: workoutSessions.completedAt,
      durationSeconds: workoutSessions.durationSeconds,
    })
    .from(workoutSessions)
    .where(
      and(
        eq(workoutSessions.status, "completed"),
        gte(workoutSessions.completedAt, previousWeekStartIso),
      ),
    );

  const sessions = sessionRows.filter(
    (session) => session.completedAt && session.completedAt >= weekStartIso,
  );
  const previousSessionCount = sessionRows.filter(
    (session) =>
      session.completedAt &&
      session.completedAt >= previousWeekStartIso &&
      session.completedAt < weekStartIso,
  ).length;
  const weekStartMs = weekStart.getTime();
  const dailySeconds = [0, 0, 0, 0, 0, 0, 0];
  for (const session of sessions) {
    const dayIndex = Math.floor(
      (new Date(session.completedAt as string).getTime() - weekStartMs) /
        86_400_000,
    );
    if (dayIndex >= 0 && dayIndex < 7) {
      dailySeconds[dayIndex] += session.durationSeconds ?? 0;
    }
  }

  const activitySeconds = sessions.reduce(
    (total, session) => total + (session.durationSeconds ?? 0),
    0,
  );

  return {
    dailySeconds,
    sessionCount: sessions.length,
    previousSessionCount,
    activitySeconds,
  };
}

export type WorkoutVolumePoint = {
  /** Epoch ms of the local calendar day — the chart x value. */
  t: number;
  totalVolumeKg: number;
};

/**
 * Total training volume (Σ weight×reps over completed working sets) per local
 * calendar day, oldest→newest, limited to `opts.since` (ISO cutoff) in the
 * query layer. Mirrors getCompletedWorkoutDailyTotals with an added sets query.
 */
export async function getCompletedWorkoutVolumeTotals(opts?: {
  since?: string;
}): Promise<WorkoutVolumePoint[]> {
  const since = opts?.since;
  const sessionRows = await db
    .select({ id: workoutSessions.id, completedAt: workoutSessions.completedAt })
    .from(workoutSessions)
    .where(
      since
        ? and(eq(workoutSessions.status, "completed"), gte(workoutSessions.completedAt, since))
        : eq(workoutSessions.status, "completed"),
    );

  const sessions = sessionRows.filter((session) => session.completedAt);
  if (sessions.length === 0) return [];

  const sessionIds = sessions.map((session) => session.id);
  const sessionExerciseRows = await db
    .select({
      id: workoutSessionExercises.id,
      workoutSessionId: workoutSessionExercises.workoutSessionId,
    })
    .from(workoutSessionExercises)
    .where(inArray(workoutSessionExercises.workoutSessionId, sessionIds));
  if (sessionExerciseRows.length === 0) return [];

  const sessionByExercise = new Map(
    sessionExerciseRows.map((row) => [row.id, row.workoutSessionId] as const),
  );

  const setRows = await db
    .select({
      workoutSessionExerciseId: workoutSets.workoutSessionExerciseId,
      weight: workoutSets.weight,
      reps: workoutSets.reps,
    })
    .from(workoutSets)
    .where(
      and(
        inArray(
          workoutSets.workoutSessionExerciseId,
          sessionExerciseRows.map((row) => row.id),
        ),
        eq(workoutSets.isCompleted, 1),
        ne(workoutSets.setType, "warmup"),
      ),
    );

  const volumeBySession = new Map<string, number>();
  for (const set of setRows) {
    if (set.weight === null || set.reps === null) continue;
    const sessionId = sessionByExercise.get(set.workoutSessionExerciseId);
    if (!sessionId) continue;
    volumeBySession.set(sessionId, (volumeBySession.get(sessionId) ?? 0) + set.weight * set.reps);
  }

  const volumeByDay = new Map<string, number>();
  for (const session of sessions) {
    const volume = volumeBySession.get(session.id) ?? 0;
    if (volume <= 0) continue;
    const dateKey = format(new Date(session.completedAt as string), "yyyy-MM-dd");
    volumeByDay.set(dateKey, (volumeByDay.get(dateKey) ?? 0) + volume);
  }

  return [...volumeByDay.entries()]
    .map(([dateKey, totalVolumeKg]) => ({
      t: Date.parse(`${dateKey}T00:00:00`),
      totalVolumeKg,
    }))
    .filter((point) => !Number.isNaN(point.t))
    .sort((a, b) => a.t - b.t);
}

export async function getWorkoutSessionDetailsById(id: string): Promise<WorkoutSessionDetails | null> {
  return hydrateWorkoutSession(id);
}

export async function getActiveWorkoutSession(): Promise<WorkoutSessionDetails | null> {
  const [active] = await db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.status, "active"))
    .orderBy(desc(workoutSessions.startedAt))
    .limit(1);

  if (!active) return null;
  return hydrateWorkoutSession(active.id);
}

/**
 * Starts the workout - or, if one is already in progress, returns that one
 * instead. Only one workout can be in progress, so "start" when one exists can
 * only sensibly mean "take me to it"; doing that here means no caller, however
 * stale its cache, can create a second.
 */
export async function startWorkout(input?: {
  name?: string;
  templateId?: string | null;
  notes?: string | null;
}): Promise<WorkoutSessionDetails> {
  const existing = await getActiveWorkoutSession();
  if (existing) return existing;

  const templateId = input?.templateId ?? null;
  insertActiveSession({
    name: input?.name?.trim() || "Workout",
    templateId,
    notes: input?.notes ?? null,
    seed: templateId ? await loadTemplateSeed(templateId) : [],
  });
  return requireActiveSession();
}

/** Starts a new workout pre-filled from a completed one. Same rule as `startWorkout`. */
export async function repeatWorkout(sourceSessionId: string): Promise<WorkoutSessionDetails> {
  const existing = await getActiveWorkoutSession();
  if (existing) return existing;

  const source = await getWorkoutSessionById(sourceSessionId);
  if (!source || source.status !== "completed") {
    throw new Error("Can only repeat a completed workout");
  }

  insertActiveSession({
    name: source.name,
    templateId: source.templateId,
    notes: null,
    seed: await loadSessionSeed(sourceSessionId),
  });
  return requireActiveSession();
}

export type FinishWorkoutOutcome = "completed" | "discarded";

/**
 * Ends the workout in progress, in one transaction.
 *
 * With `discardUnlogged`, sets never ticked off are dropped first, then any
 * exercise left with no sets; if that leaves nothing, the session itself is
 * deleted and the outcome is "discarded" rather than saving an empty workout.
 * Without it, everything is kept as-is.
 *
 * Duration is measured from this session's own `startedAt`.
 */
export async function finishWorkout(
  sessionId: string,
  options: { discardUnlogged: boolean },
): Promise<FinishWorkoutOutcome> {
  const completedAt = nowUtc();

  return db.transaction((tx) => {
    const session = tx
      .select({ startedAt: workoutSessions.startedAt })
      .from(workoutSessions)
      .where(and(eq(workoutSessions.id, sessionId), eq(workoutSessions.status, "active")))
      .get();
    if (!session) throw new Error("No workout in progress with that id");

    if (options.discardUnlogged) {
      const exerciseIds = tx
        .select({ id: workoutSessionExercises.id })
        .from(workoutSessionExercises)
        .where(eq(workoutSessionExercises.workoutSessionId, sessionId))
        .all()
        .map((row) => row.id);

      if (exerciseIds.length > 0) {
        tx.delete(workoutSets)
          .where(
            and(
              inArray(workoutSets.workoutSessionExerciseId, exerciseIds),
              eq(workoutSets.isCompleted, 0),
            ),
          )
          .run();
      }

      const idsWithSets = new Set(
        exerciseIds.length > 0
          ? tx
              .select({ id: workoutSets.workoutSessionExerciseId })
              .from(workoutSets)
              .where(inArray(workoutSets.workoutSessionExerciseId, exerciseIds))
              .all()
              .map((row) => row.id)
          : [],
      );
      const emptyIds = exerciseIds.filter((id) => !idsWithSets.has(id));
      if (emptyIds.length > 0) {
        tx.delete(workoutSessionExercises)
          .where(inArray(workoutSessionExercises.id, emptyIds))
          .run();
      }

      if (emptyIds.length === exerciseIds.length) {
        tx.delete(workoutSessions).where(eq(workoutSessions.id, sessionId)).run();
        return "discarded";
      }
    }

    tx.update(workoutSessions)
      .set({
        status: "completed",
        completedAt,
        durationSeconds: Math.max(
          0,
          Math.floor((Date.parse(completedAt) - Date.parse(session.startedAt)) / 1000),
        ),
        updatedAt: completedAt,
      })
      .where(eq(workoutSessions.id, sessionId))
      .run();
    return "completed";
  });
}

/** An edited past workout, as the history editor hands it over. */
export type CompletedWorkoutDraft = {
  name: string;
  notes: string | null;
  startedAt: string;
  completedAt: string | null;
  /** In display order. */
  exercises: {
    /** The existing row to keep, or null for an exercise added in this edit. */
    id: string | null;
    exerciseId: string;
    notes: string | null;
    /** In display order. */
    sets: {
      id: string | null;
      reps: number | null;
      weight: number | null;
      durationSeconds: number | null;
      distance: number | null;
      isCompleted: boolean;
      setType: SetType;
    }[];
  }[];
};

/**
 * Applies an edited past workout in one transaction: the session row, then its
 * exercises and sets replaced wholesale from the draft, in draft order.
 *
 * Replacing rather than diffing is safe because nothing references a
 * session-exercise or set id - personal records point at the session - and rows
 * that survive the edit keep their id and `createdAt`. Duration is derived here
 * from the edited times rather than trusted from the caller.
 */
export async function saveCompletedWorkout(
  sessionId: string,
  draft: CompletedWorkoutDraft,
): Promise<WorkoutSessionDetails> {
  const timestamp = nowUtc();

  const existingExercises = await db
    .select({ id: workoutSessionExercises.id, createdAt: workoutSessionExercises.createdAt })
    .from(workoutSessionExercises)
    .where(eq(workoutSessionExercises.workoutSessionId, sessionId));
  const existingSets =
    existingExercises.length > 0
      ? await db
          .select({ id: workoutSets.id, createdAt: workoutSets.createdAt })
          .from(workoutSets)
          .where(
            inArray(
              workoutSets.workoutSessionExerciseId,
              existingExercises.map((row) => row.id),
            ),
          )
      : [];
  // Only ids that already belong to this session are reused; anything else
  // (a client-side temp id, a stray id from elsewhere) becomes a fresh row.
  const createdAtById = new Map(
    [...existingExercises, ...existingSets].map((row) => [row.id, row.createdAt] as const),
  );
  const keepOrCreate = (id: string | null) =>
    id !== null && createdAtById.has(id) ? id : createUuid();

  const exerciseRows: (typeof workoutSessionExercises.$inferInsert)[] = [];
  const setRows: (typeof workoutSets.$inferInsert)[] = [];
  for (const [exerciseIndex, exercise] of draft.exercises.entries()) {
    const exerciseRowId = keepOrCreate(exercise.id);
    exerciseRows.push({
      id: exerciseRowId,
      workoutSessionId: sessionId,
      exerciseId: exercise.exerciseId,
      orderIndex: exerciseIndex,
      notes: exercise.notes,
      createdAt: createdAtById.get(exerciseRowId) ?? timestamp,
      updatedAt: timestamp,
    });
    for (const [setIndex, set] of exercise.sets.entries()) {
      const setRowId = keepOrCreate(set.id);
      setRows.push({
        id: setRowId,
        workoutSessionExerciseId: exerciseRowId,
        orderIndex: setIndex,
        reps: set.reps,
        weight: set.weight,
        durationSeconds: set.durationSeconds,
        distance: set.distance,
        isCompleted: set.isCompleted ? 1 : 0,
        setType: set.setType,
        createdAt: createdAtById.get(setRowId) ?? timestamp,
        updatedAt: timestamp,
      });
    }
  }

  const durationSeconds = draft.completedAt
    ? Math.max(
        0,
        Math.floor((Date.parse(draft.completedAt) - Date.parse(draft.startedAt)) / 1000),
      )
    : null;

  // Synchronous on expo-sqlite - see insertActiveSession.
  db.transaction((tx) => {
    const session = tx
      .select({ status: workoutSessions.status })
      .from(workoutSessions)
      .where(eq(workoutSessions.id, sessionId))
      .get();
    if (!session || session.status !== "completed") {
      throw new Error("Can only edit completed workouts");
    }

    tx.update(workoutSessions)
      .set({
        name: draft.name.trim() || "Workout",
        notes: draft.notes,
        startedAt: draft.startedAt,
        completedAt: draft.completedAt,
        durationSeconds,
        updatedAt: timestamp,
      })
      .where(eq(workoutSessions.id, sessionId))
      .run();

    // Cascades to the sets.
    tx.delete(workoutSessionExercises)
      .where(eq(workoutSessionExercises.workoutSessionId, sessionId))
      .run();
    for (const batch of chunk(exerciseRows)) {
      tx.insert(workoutSessionExercises).values(batch).run();
    }
    for (const batch of chunk(setRows)) {
      tx.insert(workoutSets).values(batch).run();
    }
  });

  const hydrated = await hydrateWorkoutSession(sessionId);
  if (!hydrated) throw new Error("Failed to save workout");
  return hydrated;
}

export async function renameWorkoutSession(
  id: string,
  name: string,
): Promise<WorkoutSessionDetails | null> {
  await db
    .update(workoutSessions)
    .set({ name: name.trim() || "Workout", updatedAt: nowUtc() })
    .where(eq(workoutSessions.id, id));
  return hydrateWorkoutSession(id);
}

/**
 * Discards the workout in progress. One statement, so it is atomic, and the
 * schema's cascades take the exercises and sets with it. Scoped to `active`, so
 * it can never delete finished history; on anything else it is a no-op.
 */
export async function cancelWorkout(sessionId: string): Promise<void> {
  await db
    .delete(workoutSessions)
    .where(and(eq(workoutSessions.id, sessionId), eq(workoutSessions.status, "active")));
}

export async function addExerciseToWorkout(input: {
  workoutSessionId: string;
  exerciseId: string;
  orderIndex?: number;
  notes?: string | null;
}): Promise<WorkoutSessionDetails> {
  const id = createUuid();
  const timestamp = nowUtc();
  const orderIndex = input.orderIndex ?? (await getNextExerciseOrderIndex(input.workoutSessionId));

  await db.insert(workoutSessionExercises).values({
    id,
    workoutSessionId: input.workoutSessionId,
    exerciseId: input.exerciseId,
    orderIndex,
    notes: input.notes ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const hydrated = await hydrateWorkoutSession(input.workoutSessionId);
  if (!hydrated) throw new Error("Failed add exercise to workout");
  return hydrated;
}

export async function removeExerciseFromWorkout(
  workoutSessionId: string,
  workoutSessionExerciseId: string,
): Promise<WorkoutSessionDetails> {
  await db.delete(workoutSessionExercises).where(eq(workoutSessionExercises.id, workoutSessionExerciseId));
  const rows = await db
    .select()
    .from(workoutSessionExercises)
    .where(eq(workoutSessionExercises.workoutSessionId, workoutSessionId))
    .orderBy(asc(workoutSessionExercises.orderIndex));

  const timestamp = nowUtc();
  for (const [index, row] of rows.entries()) {
    if (row.orderIndex !== index) {
      await db
        .update(workoutSessionExercises)
        .set({ orderIndex: index, updatedAt: timestamp })
        .where(eq(workoutSessionExercises.id, row.id));
    }
  }

  const hydrated = await hydrateWorkoutSession(workoutSessionId);
  if (!hydrated) throw new Error("Failed remove exercise from workout");
  return hydrated;
}

export async function addSetToWorkout(input: {
  workoutSessionExerciseId: string;
  orderIndex?: number;
  reps?: number | null;
  weight?: number | null;
  durationSeconds?: number | null;
  distance?: number | null;
  isCompleted?: boolean;
  setType?: SetType;
}): Promise<WorkoutSessionDetails> {
  const id = createUuid();
  const timestamp = nowUtc();
  const orderIndex = input.orderIndex ?? (await getNextSetOrderIndex(input.workoutSessionExerciseId));

  await db.insert(workoutSets).values({
    id,
    workoutSessionExerciseId: input.workoutSessionExerciseId,
    orderIndex,
    reps: input.reps ?? null,
    weight: input.weight ?? null,
    durationSeconds: input.durationSeconds ?? null,
    distance: input.distance ?? null,
    isCompleted: input.isCompleted ? 1 : 0,
    setType: input.setType ?? "normal",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const [sessionExercise] = await db
    .select()
    .from(workoutSessionExercises)
    .where(eq(workoutSessionExercises.id, input.workoutSessionExerciseId))
    .limit(1);
  if (!sessionExercise) throw new Error("Workout exercise not found");

  const hydrated = await hydrateWorkoutSession(sessionExercise.workoutSessionId);
  if (!hydrated) throw new Error("Failed add workout set");
  return hydrated;
}

export async function updateSet(
  setId: string,
  input: {
    orderIndex?: number;
    reps?: number | null;
    weight?: number | null;
    durationSeconds?: number | null;
    distance?: number | null;
    isCompleted?: boolean;
    setType?: SetType;
  },
): Promise<WorkoutSessionDetails> {
  await db
    .update(workoutSets)
    .set({
      ...(input.orderIndex !== undefined ? { orderIndex: input.orderIndex } : {}),
      ...(input.reps !== undefined ? { reps: input.reps } : {}),
      ...(input.weight !== undefined ? { weight: input.weight } : {}),
      ...(input.durationSeconds !== undefined ? { durationSeconds: input.durationSeconds } : {}),
      ...(input.distance !== undefined ? { distance: input.distance } : {}),
      ...(input.isCompleted !== undefined ? { isCompleted: input.isCompleted ? 1 : 0 } : {}),
      ...(input.setType !== undefined ? { setType: input.setType } : {}),
      updatedAt: nowUtc(),
    })
    .where(eq(workoutSets.id, setId));

  const [setRow] = await db.select().from(workoutSets).where(eq(workoutSets.id, setId)).limit(1);
  if (!setRow) throw new Error("Workout set not found");

  const [sessionExercise] = await db
    .select()
    .from(workoutSessionExercises)
    .where(eq(workoutSessionExercises.id, setRow.workoutSessionExerciseId))
    .limit(1);
  if (!sessionExercise) throw new Error("Workout exercise not found");

  const hydrated = await hydrateWorkoutSession(sessionExercise.workoutSessionId);
  if (!hydrated) throw new Error("Failed update workout set");
  return hydrated;
}

export async function deleteSet(setId: string): Promise<WorkoutSessionDetails> {
  const [setRow] = await db.select().from(workoutSets).where(eq(workoutSets.id, setId)).limit(1);
  if (!setRow) throw new Error("Workout set not found");

  const [sessionExercise] = await db
    .select()
    .from(workoutSessionExercises)
    .where(eq(workoutSessionExercises.id, setRow.workoutSessionExerciseId))
    .limit(1);
  if (!sessionExercise) throw new Error("Workout exercise not found");

  await db.delete(workoutSets).where(eq(workoutSets.id, setId));
  const rows = await db
    .select()
    .from(workoutSets)
    .where(eq(workoutSets.workoutSessionExerciseId, setRow.workoutSessionExerciseId))
    .orderBy(asc(workoutSets.orderIndex));
  const timestamp = nowUtc();
  for (const [index, row] of rows.entries()) {
    if (row.orderIndex !== index) {
      await db.update(workoutSets).set({ orderIndex: index, updatedAt: timestamp }).where(eq(workoutSets.id, row.id));
    }
  }

  const hydrated = await hydrateWorkoutSession(sessionExercise.workoutSessionId);
  if (!hydrated) throw new Error("Failed delete workout set");
  return hydrated;
}

export async function updateWorkoutExerciseNotes(
  workoutSessionExerciseId: string,
  notes: string | null,
): Promise<WorkoutSessionDetails> {
  await db
    .update(workoutSessionExercises)
    .set({
      notes,
      updatedAt: nowUtc(),
    })
    .where(eq(workoutSessionExercises.id, workoutSessionExerciseId));

  const [sessionExercise] = await db
    .select()
    .from(workoutSessionExercises)
    .where(eq(workoutSessionExercises.id, workoutSessionExerciseId))
    .limit(1);
  if (!sessionExercise) throw new Error("Workout exercise not found");

  const hydrated = await hydrateWorkoutSession(sessionExercise.workoutSessionId);
  if (!hydrated) throw new Error("Failed update exercise notes");
  return hydrated;
}

export async function ensureWorkoutIsActive(workoutSessionId: string): Promise<boolean> {
  const [row] = await db
    .select()
    .from(workoutSessions)
    .where(and(eq(workoutSessions.id, workoutSessionId), eq(workoutSessions.status, "active")))
    .limit(1);
  return Boolean(row);
}

/**
 * Deletes a finished workout from history. The workout in progress is ended
 * through `cancelWorkout`/`finishWorkout` instead, so this skips it.
 */
export async function deleteWorkoutSession(id: string): Promise<void> {
  await db
    .delete(workoutSessions)
    .where(and(eq(workoutSessions.id, id), ne(workoutSessions.status, "active")));
}
