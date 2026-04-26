import { asc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { createUuid, nowUtc } from "@/db/utils";
import {
  workoutTemplateExercises,
  workoutTemplates,
  type WorkoutTemplate,
  type WorkoutTemplateExercise,
} from "@/db/schema";

export async function createWorkoutTemplate(input: {
  name: string;
  description?: string | null;
}): Promise<WorkoutTemplate> {
  const id = createUuid();
  const timestamp = nowUtc();

  await db.insert(workoutTemplates).values({
    id,
    name: input.name,
    description: input.description ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const created = await getWorkoutTemplateById(id);
  if (!created) throw new Error("Failed create workout template");
  return created;
}

export async function getWorkoutTemplateById(id: string): Promise<WorkoutTemplate | null> {
  const [row] = await db.select().from(workoutTemplates).where(eq(workoutTemplates.id, id)).limit(1);
  return row ?? null;
}

export async function listWorkoutTemplates(): Promise<WorkoutTemplate[]> {
  return db.select().from(workoutTemplates).orderBy(asc(workoutTemplates.name));
}

export async function addExerciseToTemplate(input: {
  templateId: string;
  exerciseId: string;
  orderIndex?: number;
  notes?: string | null;
}): Promise<WorkoutTemplateExercise> {
  const id = createUuid();
  const timestamp = nowUtc();

  await db.insert(workoutTemplateExercises).values({
    id,
    templateId: input.templateId,
    exerciseId: input.exerciseId,
    orderIndex: input.orderIndex ?? 0,
    notes: input.notes ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const [row] = await db
    .select()
    .from(workoutTemplateExercises)
    .where(eq(workoutTemplateExercises.id, id))
    .limit(1);

  if (!row) throw new Error("Failed add exercise to template");
  return row;
}
