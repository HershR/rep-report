import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { createUuid, nowUtc } from "@/db/utils";
import {
  workoutSessionExercises,
  workoutSessions,
  workoutSets,
  type WorkoutSession,
  type WorkoutSessionExercise,
  type WorkoutSet,
} from "@/db/schema";

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

export async function addExerciseToWorkoutSession(input: {
  workoutSessionId: string;
  exerciseId: string;
  orderIndex?: number;
  notes?: string | null;
}): Promise<WorkoutSessionExercise> {
  const id = createUuid();
  const timestamp = nowUtc();

  await db.insert(workoutSessionExercises).values({
    id,
    workoutSessionId: input.workoutSessionId,
    exerciseId: input.exerciseId,
    orderIndex: input.orderIndex ?? 0,
    notes: input.notes ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const [row] = await db
    .select()
    .from(workoutSessionExercises)
    .where(eq(workoutSessionExercises.id, id))
    .limit(1);

  if (!row) throw new Error("Failed add exercise to workout session");
  return row;
}

export async function addWorkoutSet(input: {
  workoutSessionExerciseId: string;
  orderIndex?: number;
  reps?: number | null;
  weight?: number | null;
  durationSeconds?: number | null;
  distance?: number | null;
  isCompleted?: boolean;
  setType?: "normal" | "warmup" | "drop" | "failure";
}): Promise<WorkoutSet> {
  const id = createUuid();
  const timestamp = nowUtc();

  await db.insert(workoutSets).values({
    id,
    workoutSessionExerciseId: input.workoutSessionExerciseId,
    orderIndex: input.orderIndex ?? 0,
    reps: input.reps ?? null,
    weight: input.weight ?? null,
    durationSeconds: input.durationSeconds ?? null,
    distance: input.distance ?? null,
    isCompleted: input.isCompleted ? 1 : 0,
    setType: input.setType ?? "normal",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const [row] = await db.select().from(workoutSets).where(eq(workoutSets.id, id)).limit(1);
  if (!row) throw new Error("Failed add workout set");
  return row;
}
