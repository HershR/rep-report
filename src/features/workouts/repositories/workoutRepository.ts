import { and, asc, desc, eq, inArray, ne } from "drizzle-orm";
import { format } from "date-fns";

import { db } from "@/db/client";
import { createUuid, nowUtc } from "@/db/utils";
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

async function deleteWorkoutSessionGraph(sessionId: string): Promise<void> {
  const sessionExercises = await db
    .select({ id: workoutSessionExercises.id })
    .from(workoutSessionExercises)
    .where(eq(workoutSessionExercises.workoutSessionId, sessionId));

  const sessionExerciseIds = sessionExercises.map((row) => row.id);
  if (sessionExerciseIds.length > 0) {
    await db
      .delete(workoutSets)
      .where(inArray(workoutSets.workoutSessionExerciseId, sessionExerciseIds));
  }

  await db
    .delete(workoutSessionExercises)
    .where(eq(workoutSessionExercises.workoutSessionId, sessionId));
  await db.delete(workoutSessions).where(eq(workoutSessions.id, sessionId));
}

export async function createWorkoutSession(input: {
  name: string;
  templateId?: string | null;
  notes?: string | null;
}): Promise<WorkoutSession> {
  const id = createUuid();
  const timestamp = nowUtc();

  await db.insert(workoutSessions).values({
    id,
    templateId: input.templateId ?? null,
    name: input.name,
    startedAt: timestamp,
    completedAt: null,
    durationSeconds: null,
    notes: input.notes ?? null,
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const created = await getWorkoutSessionById(id);
  if (!created) throw new Error("Failed create workout session");
  return created;
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

  const rows = await db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.status, "completed"))
    .orderBy(desc(workoutSessions.completedAt));

  const filtered = rows.filter((row) => {
    if (!row.completedAt) return false;
    return row.completedAt >= startUtcIso && row.completedAt <= endUtcIso;
  });

  const hydrated = await Promise.all(filtered.map((row) => hydrateWorkoutSession(row.id)));
  return hydrated.filter((row): row is WorkoutSessionDetails => Boolean(row));
}

export type WorkoutDailyTotal = {
  dateKey: string;
  exerciseCount: number;
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
    } else {
      totalsByDay.set(dateKey, { dateKey, exerciseCount: sessionExerciseCount });
    }
  }

  return [...totalsByDay.values()];
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
  const sessionRows = await db
    .select({ id: workoutSessions.id, completedAt: workoutSessions.completedAt })
    .from(workoutSessions)
    .where(eq(workoutSessions.status, "completed"));

  const since = opts?.since;
  const sessions = sessionRows.filter(
    (session) => session.completedAt && (!since || session.completedAt >= since),
  );
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

export async function resumeWorkout(sessionId?: string): Promise<WorkoutSessionDetails | null> {
  if (sessionId) return hydrateWorkoutSession(sessionId);
  return getActiveWorkoutSession();
}

export async function startWorkout(input?: {
  name?: string;
  templateId?: string | null;
  notes?: string | null;
}): Promise<WorkoutSessionDetails> {
  const templateId = input?.templateId ?? null;
  const now = nowUtc();
  const session = await createWorkoutSession({
    name: input?.name?.trim() || "Workout",
    templateId,
    notes: input?.notes ?? null,
  });

  if (templateId) {
    const templateExerciseRows = await db
      .select()
      .from(workoutTemplateExercises)
      .where(eq(workoutTemplateExercises.templateId, templateId))
      .orderBy(asc(workoutTemplateExercises.orderIndex));

    for (const templateExercise of templateExerciseRows) {
      const sessionExerciseId = createUuid();
      await db.insert(workoutSessionExercises).values({
        id: sessionExerciseId,
        workoutSessionId: session.id,
        exerciseId: templateExercise.exerciseId,
        orderIndex: templateExercise.orderIndex,
        notes: templateExercise.notes,
        createdAt: now,
        updatedAt: now,
      });

      const templateSetRows = await db
        .select()
        .from(workoutTemplateSets)
        .where(eq(workoutTemplateSets.templateExerciseId, templateExercise.id))
        .orderBy(asc(workoutTemplateSets.orderIndex));

      for (const templateSet of templateSetRows) {
        await db.insert(workoutSets).values({
          id: createUuid(),
          workoutSessionExerciseId: sessionExerciseId,
          orderIndex: templateSet.orderIndex,
          reps: templateSet.targetReps,
          weight: templateSet.targetWeight,
          durationSeconds: templateSet.targetDurationSeconds,
          distance: templateSet.targetDistance,
          isCompleted: 0,
          setType: templateSet.setType,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  const hydrated = await hydrateWorkoutSession(session.id);
  if (!hydrated) throw new Error("Failed start workout");
  return hydrated;
}

export async function repeatWorkout(sourceSessionId: string): Promise<WorkoutSessionDetails> {
  const source = await getWorkoutSessionById(sourceSessionId);
  if (!source || source.status !== "completed") {
    throw new Error("Can only repeat a completed workout");
  }

  const now = nowUtc();
  const session = await createWorkoutSession({
    name: source.name,
    templateId: source.templateId,
    notes: null,
  });

  const sourceExerciseRows = await db
    .select()
    .from(workoutSessionExercises)
    .where(eq(workoutSessionExercises.workoutSessionId, sourceSessionId))
    .orderBy(asc(workoutSessionExercises.orderIndex));

  for (const sourceExercise of sourceExerciseRows) {
    const sessionExerciseId = createUuid();
    await db.insert(workoutSessionExercises).values({
      id: sessionExerciseId,
      workoutSessionId: session.id,
      exerciseId: sourceExercise.exerciseId,
      orderIndex: sourceExercise.orderIndex,
      notes: sourceExercise.notes,
      createdAt: now,
      updatedAt: now,
    });

    const sourceSetRows = await db
      .select()
      .from(workoutSets)
      .where(eq(workoutSets.workoutSessionExerciseId, sourceExercise.id))
      .orderBy(asc(workoutSets.orderIndex));

    for (const sourceSet of sourceSetRows) {
      await db.insert(workoutSets).values({
        id: createUuid(),
        workoutSessionExerciseId: sessionExerciseId,
        orderIndex: sourceSet.orderIndex,
        reps: sourceSet.reps,
        weight: sourceSet.weight,
        durationSeconds: sourceSet.durationSeconds,
        distance: sourceSet.distance,
        isCompleted: 0,
        setType: sourceSet.setType,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  const hydrated = await hydrateWorkoutSession(session.id);
  if (!hydrated) throw new Error("Failed repeat workout");
  return hydrated;
}

export async function completeWorkout(
  sessionId: string,
  input?: { completedAt?: string; durationSeconds?: number | null },
): Promise<WorkoutSession | null> {
  await db
    .update(workoutSessions)
    .set({
      status: "completed",
      completedAt: input?.completedAt ?? nowUtc(),
      durationSeconds: input?.durationSeconds ?? null,
      updatedAt: nowUtc(),
    })
    .where(eq(workoutSessions.id, sessionId));

  return getWorkoutSessionById(sessionId);
}

export async function updateCompletedWorkout(
  id: string,
  input: {
    name?: string;
    notes?: string | null;
    completedAt?: string | null;
    durationSeconds?: number | null;
  },
): Promise<WorkoutSessionDetails | null> {
  const current = await getWorkoutSessionById(id);
  if (!current) return null;
  if (current.status !== "completed") {
    throw new Error("Can only edit completed workouts");
  }

  await db
    .update(workoutSessions)
    .set({
      ...(input.name !== undefined ? { name: input.name.trim() || "Workout" } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.completedAt !== undefined ? { completedAt: input.completedAt } : {}),
      ...(input.durationSeconds !== undefined ? { durationSeconds: input.durationSeconds } : {}),
      updatedAt: nowUtc(),
    })
    .where(eq(workoutSessions.id, id));

  return hydrateWorkoutSession(id);
}

export async function cancelWorkout(sessionId: string): Promise<WorkoutSession | null> {
  await deleteWorkoutSessionGraph(sessionId);
  return null;
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

export async function reorderWorkoutExercises(
  workoutSessionId: string,
  orderedExerciseIds: string[],
): Promise<WorkoutSessionDetails> {
  const idToIndex = new Map(orderedExerciseIds.map((id, index) => [id, index] as const));
  const rows = await db
    .select()
    .from(workoutSessionExercises)
    .where(eq(workoutSessionExercises.workoutSessionId, workoutSessionId));

  const timestamp = nowUtc();
  for (const row of rows) {
    const nextIndex = idToIndex.get(row.id);
    if (nextIndex !== undefined && row.orderIndex !== nextIndex) {
      await db
        .update(workoutSessionExercises)
        .set({ orderIndex: nextIndex, updatedAt: timestamp })
        .where(eq(workoutSessionExercises.id, row.id));
    }
  }

  const hydrated = await hydrateWorkoutSession(workoutSessionId);
  if (!hydrated) throw new Error("Failed reorder workout exercises");
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

export async function removeIncompleteSets(workoutSessionId: string): Promise<WorkoutSessionDetails> {
  const sessionExercises = await db
    .select({ id: workoutSessionExercises.id })
    .from(workoutSessionExercises)
    .where(eq(workoutSessionExercises.workoutSessionId, workoutSessionId));

  const sessionExerciseIds = sessionExercises.map((row) => row.id);
  if (sessionExerciseIds.length > 0) {
    await db
      .delete(workoutSets)
      .where(
        and(
          inArray(workoutSets.workoutSessionExerciseId, sessionExerciseIds),
          eq(workoutSets.isCompleted, 0),
        ),
      );
  }

  const hydrated = await hydrateWorkoutSession(workoutSessionId);
  if (!hydrated) throw new Error("Failed remove incomplete sets");
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

export async function deleteWorkoutSession(id: string): Promise<void> {
  const current = await getWorkoutSessionById(id);
  if (!current) return;
  if (current.status === "active") {
    throw new Error("Cannot delete active workout session");
  }
  await deleteWorkoutSessionGraph(id);
}
