import { like } from "drizzle-orm";

import { db } from "@/db/client";
import {
  measurements,
  workoutSessionExercises,
  workoutSessions,
  workoutSets,
  workoutTemplateExercises,
  workoutTemplateSets,
  workoutTemplates,
} from "@/db/schema";
import { nowUtc } from "@/db/utils";
import {
  DEMO_EXERCISE_WGER_IDS,
  type DemoExerciseKey,
  loadDemoExercises,
} from "@/db/devSeed/exercises";
import { buildDemoPlan, type DemoPlan } from "@/db/devSeed/plan";
import { saveFavoriteExercise } from "@/features/exercises/repositories/exerciseRepository";

/**
 * Dev-only demo data. Populates the local database with a realistic training
 * history so the progress, records and history surfaces have something to show
 * on a fresh install.
 *
 * Two deliberate departures from the conventions in CLAUDE.md:
 *
 * 1. Sessions, sets, templates and measurements are written with raw drizzle
 *    rather than through the feature repositories. The repositories hardcode
 *    `nowUtc()` for `startedAt`/`createdAt`/`updatedAt` — there is no way to
 *    backdate through them — and `addSetToWorkout` re-hydrates the whole
 *    session graph on every call, which would be thousands of queries for the
 *    ~400 rows seeded here. `src/db/` is where this codebase already keeps its
 *    raw-drizzle seeding (see `seed.ts`), and nothing in `src/features/`
 *    imports this module.
 *
 * 2. Exercises are the exception: they go through `saveFavoriteExercise`,
 *    which already upserts on the unique `wger_exercise_id` index *and*
 *    preserves the existing row id — so re-seeding never orphans a template
 *    the user built on top of a seeded exercise.
 *
 * Provenance is tracked by giving every seeded row a `demo-` prefixed primary
 * key. Everything else in the app uses `createUuid()`, so `LIKE 'demo-%'` is an
 * unambiguous marker; the trade is that a hand-made row with that prefix would
 * be swept up by `clearDemoData`.
 */

/** Rows per INSERT. Comfortably under SQLite's parameter and compound-select limits. */
const BATCH_ROWS = 80;

function chunk<T>(rows: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let index = 0; index < rows.length; index += size) {
    batches.push(rows.slice(index, index + size));
  }
  return batches;
}

export async function isDemoDataSeeded(): Promise<boolean> {
  const [row] = await db
    .select({ id: workoutSessions.id })
    .from(workoutSessions)
    .where(like(workoutSessions.id, "demo-%"))
    .limit(1);
  return Boolean(row);
}

/**
 * Drops the seeded sessions, templates and measurements. Child rows go with
 * them via the schema's cascading foreign keys.
 *
 * Exercises are intentionally left behind: they are ordinary wger rows that the
 * user may have built their own templates on, and `exercise_id` foreign keys
 * are `onDelete: restrict`, so deleting them could throw anyway.
 */
export async function clearDemoData(): Promise<void> {
  await db.delete(workoutSessions).where(like(workoutSessions.id, "demo-%"));
  await db.delete(workoutTemplates).where(like(workoutTemplates.id, "demo-%"));
  await db.delete(measurements).where(like(measurements.id, "demo-%"));
}

type SeedCounts = {
  exercises: number;
  templates: number;
  sessions: number;
  sets: number;
  measurements: number;
};

/**
 * Always clear-then-seed, so pressing the button twice yields one dataset
 * rather than two and re-anchors every date to today.
 */
export async function seedDemoData(): Promise<SeedCounts> {
  const demoExercises = loadDemoExercises();
  const keys = Object.keys(DEMO_EXERCISE_WGER_IDS) as DemoExerciseKey[];

  // Upserts happen before the transaction: they're async, and the plan needs
  // the local row ids they return.
  const exerciseIdByKey = {} as Record<DemoExerciseKey, string>;
  for (const key of keys) {
    const saved = await saveFavoriteExercise(demoExercises[key]);
    exerciseIdByKey[key] = saved.id;
  }

  await clearDemoData();

  const plan = buildDemoPlan(new Date());
  const rows = buildRows(plan, exerciseIdByKey);

  // `db.transaction` on expo-sqlite is SYNCHRONOUS: it runs `begin`, invokes
  // this callback, and commits the moment the callback returns. An async
  // callback would commit before the inserts ran, with no error. Nothing in
  // here may await — which is why the plan is built above, not inside.
  db.transaction((tx) => {
    for (const batch of chunk(rows.templates, BATCH_ROWS)) {
      tx.insert(workoutTemplates).values(batch).run();
    }
    for (const batch of chunk(rows.templateExercises, BATCH_ROWS)) {
      tx.insert(workoutTemplateExercises).values(batch).run();
    }
    for (const batch of chunk(rows.templateSets, BATCH_ROWS)) {
      tx.insert(workoutTemplateSets).values(batch).run();
    }
    for (const batch of chunk(rows.sessions, BATCH_ROWS)) {
      tx.insert(workoutSessions).values(batch).run();
    }
    for (const batch of chunk(rows.sessionExercises, BATCH_ROWS)) {
      tx.insert(workoutSessionExercises).values(batch).run();
    }
    for (const batch of chunk(rows.sets, BATCH_ROWS)) {
      tx.insert(workoutSets).values(batch).run();
    }
    for (const batch of chunk(rows.measurements, BATCH_ROWS)) {
      tx.insert(measurements).values(batch).run();
    }
  });

  return {
    exercises: keys.length,
    templates: rows.templates.length,
    sessions: rows.sessions.length,
    sets: rows.sets.length,
    measurements: rows.measurements.length,
  };
}

type DemoRows = {
  templates: (typeof workoutTemplates.$inferInsert)[];
  templateExercises: (typeof workoutTemplateExercises.$inferInsert)[];
  templateSets: (typeof workoutTemplateSets.$inferInsert)[];
  sessions: (typeof workoutSessions.$inferInsert)[];
  sessionExercises: (typeof workoutSessionExercises.$inferInsert)[];
  sets: (typeof workoutSets.$inferInsert)[];
  measurements: (typeof measurements.$inferInsert)[];
};

/**
 * Flattens the plan into insert-ready rows. `createdAt`/`updatedAt` follow the
 * event they describe rather than the seed run, so the data reads as history
 * rather than as something written all at once.
 */
function buildRows(
  plan: DemoPlan,
  exerciseIdByKey: Record<DemoExerciseKey, string>,
): DemoRows {
  const rows: DemoRows = {
    templates: [],
    templateExercises: [],
    templateSets: [],
    sessions: [],
    sessionExercises: [],
    sets: [],
    measurements: [],
  };

  const firstSessionAt = plan.sessions[0]?.startedAt ?? nowUtc();

  for (const template of plan.templates) {
    rows.templates.push({
      id: template.id,
      name: template.name,
      description: template.description,
      createdAt: firstSessionAt,
      updatedAt: firstSessionAt,
    });

    for (const exercise of template.exercises) {
      rows.templateExercises.push({
        id: exercise.id,
        templateId: template.id,
        exerciseId: exerciseIdByKey[exercise.key],
        orderIndex: exercise.orderIndex,
        notes: null,
        createdAt: firstSessionAt,
        updatedAt: firstSessionAt,
      });

      for (const set of exercise.sets) {
        rows.templateSets.push({
          id: set.id,
          templateExerciseId: exercise.id,
          orderIndex: set.orderIndex,
          targetReps: set.targetReps,
          targetWeight: set.targetWeightKg,
          targetDurationSeconds: null,
          targetDistance: null,
          setType: set.setType,
          createdAt: firstSessionAt,
          updatedAt: firstSessionAt,
        });
      }
    }
  }

  for (const session of plan.sessions) {
    rows.sessions.push({
      id: session.id,
      templateId: session.templateId,
      name: session.name,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      durationSeconds: session.durationSeconds,
      notes: null,
      status: "completed",
      createdAt: session.startedAt,
      updatedAt: session.completedAt,
    });

    for (const exercise of session.exercises) {
      rows.sessionExercises.push({
        id: exercise.id,
        workoutSessionId: session.id,
        exerciseId: exerciseIdByKey[exercise.key],
        orderIndex: exercise.orderIndex,
        notes: null,
        createdAt: session.startedAt,
        updatedAt: session.completedAt,
      });

      for (const set of exercise.sets) {
        rows.sets.push({
          id: set.id,
          workoutSessionExerciseId: exercise.id,
          orderIndex: set.orderIndex,
          reps: set.reps,
          weight: set.weightKg,
          durationSeconds: null,
          distance: null,
          isCompleted: 1,
          setType: set.setType,
          createdAt: session.startedAt,
          updatedAt: session.completedAt,
        });
      }
    }
  }

  for (const measurement of plan.measurements) {
    rows.measurements.push({
      id: measurement.id,
      measurementType: measurement.measurementType,
      value: measurement.value,
      unit: measurement.unit,
      measuredAt: measurement.measuredAt,
      notes: null,
      createdAt: measurement.measuredAt,
      updatedAt: measurement.measuredAt,
    });
  }

  return rows;
}
