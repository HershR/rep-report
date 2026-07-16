import { asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db/client";
import { createUuid, nowUtc } from "@/db/utils";
import {
  type SetType,
  exercises,
  workoutTemplateSets,
  workoutTemplateExercises,
  workoutTemplates,
} from "@/db/schema";
import type {
  CreateWorkoutTemplateInput,
  UpdateWorkoutTemplateInput,
  WorkoutTemplate,
  WorkoutTemplateExercise,
  WorkoutTemplateSet,
} from "@/features/templates/types";

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

async function hydrateTemplate(templateId: string): Promise<WorkoutTemplate | null> {
  const [template] = await db
    .select()
    .from(workoutTemplates)
    .where(eq(workoutTemplates.id, templateId))
    .limit(1);
  if (!template) return null;

  const templateExerciseRows = await db
    .select()
    .from(workoutTemplateExercises)
    .where(eq(workoutTemplateExercises.templateId, templateId))
    .orderBy(asc(workoutTemplateExercises.orderIndex));

  if (templateExerciseRows.length === 0) {
    return { ...template, exercises: [] };
  }

  const exerciseRows = await db
    .select()
    .from(exercises)
    .where(
      inArray(
        exercises.id,
        templateExerciseRows.map((row) => row.exerciseId),
      ),
    );

  const setsRows = await db
    .select()
    .from(workoutTemplateSets)
    .where(
      inArray(
        workoutTemplateSets.templateExerciseId,
        templateExerciseRows.map((row) => row.id),
      ),
    )
    .orderBy(asc(workoutTemplateSets.orderIndex));

  const exerciseMap = new Map(exerciseRows.map((row) => [row.id, row]));
  const setsByTemplateExercise = new Map<string, WorkoutTemplateSet[]>();
  for (const set of setsRows) {
    const list = setsByTemplateExercise.get(set.templateExerciseId) ?? [];
    list.push(set as WorkoutTemplateSet);
    setsByTemplateExercise.set(set.templateExerciseId, list);
  }

  const hydratedExercises: WorkoutTemplateExercise[] = templateExerciseRows
    .map((templateExercise) => {
      const exercise = exerciseMap.get(templateExercise.exerciseId);
      if (!exercise) return null;
      return {
        ...templateExercise,
        exercise: {
          id: exercise.id,
          wgerExerciseId: exercise.wgerExerciseId,
          name: exercise.name,
          description: exercise.description,
          category: exercise.category,
          equipment: parseJsonArray(exercise.equipment),
          primaryMuscles: parseJsonArray(exercise.primaryMuscles),
          secondaryMuscles: parseJsonArray(exercise.secondaryMuscles),
          imageUrl: exercise.imageUrl,
          source: exercise.source,
          isFavorite: exercise.isFavorite === 1,
          createdAt: exercise.createdAt,
          updatedAt: exercise.updatedAt,
        },
        sets: setsByTemplateExercise.get(templateExercise.id) ?? [],
      };
    })
    .filter((item): item is WorkoutTemplateExercise => Boolean(item));

  return {
    ...template,
    exercises: hydratedExercises,
  };
}

export async function createWorkoutTemplate(input: CreateWorkoutTemplateInput): Promise<WorkoutTemplate> {
  const id = createUuid();
  const timestamp = nowUtc();

  await db.insert(workoutTemplates).values({
    id,
    name: input.name.trim(),
    description: input.description ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const created = await getWorkoutTemplateById(id);
  if (!created) throw new Error("Failed create workout template");
  return created;
}

export async function getWorkoutTemplateById(id: string): Promise<WorkoutTemplate | null> {
  return hydrateTemplate(id);
}

export async function getWorkoutTemplates(): Promise<WorkoutTemplate[]> {
  const rows = await db.select().from(workoutTemplates).orderBy(asc(workoutTemplates.name));
  const templates = await Promise.all(rows.map((row) => hydrateTemplate(row.id)));
  return templates.filter((template): template is WorkoutTemplate => Boolean(template));
}

export async function updateWorkoutTemplate(
  id: string,
  input: UpdateWorkoutTemplateInput,
): Promise<WorkoutTemplate | null> {
  await db
    .update(workoutTemplates)
    .set({
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      updatedAt: nowUtc(),
    })
    .where(eq(workoutTemplates.id, id));

  return getWorkoutTemplateById(id);
}

export async function deleteWorkoutTemplate(id: string): Promise<void> {
  await db.delete(workoutTemplates).where(eq(workoutTemplates.id, id));
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

  const [inserted] = await db
    .select()
    .from(workoutTemplateExercises)
    .where(eq(workoutTemplateExercises.id, id))
    .limit(1);

  if (!inserted) throw new Error("Failed add exercise to template");
  const template = await getWorkoutTemplateById(input.templateId);
  const row = template?.exercises.find((exercise) => exercise.id === inserted.id);
  if (!row) throw new Error("Failed load template exercise");
  return row;
}

export async function removeExerciseFromTemplate(templateExerciseId: string): Promise<void> {
  await db.delete(workoutTemplateExercises).where(eq(workoutTemplateExercises.id, templateExerciseId));
}

export async function updateTemplateExercise(
  id: string,
  input: { orderIndex?: number; notes?: string | null },
): Promise<WorkoutTemplateExercise | null> {
  await db
    .update(workoutTemplateExercises)
    .set({
      ...(input.orderIndex !== undefined ? { orderIndex: input.orderIndex } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      updatedAt: nowUtc(),
    })
    .where(eq(workoutTemplateExercises.id, id));

  const [row] = await db.select().from(workoutTemplateExercises).where(eq(workoutTemplateExercises.id, id)).limit(1);
  if (!row) return null;
  const template = await getWorkoutTemplateById(row.templateId);
  return template?.exercises.find((exercise) => exercise.id === id) ?? null;
}

export async function addSetToTemplateExercise(input: {
  templateExerciseId: string;
  orderIndex?: number;
  targetReps?: number | null;
  targetWeight?: number | null;
  targetDurationSeconds?: number | null;
  targetDistance?: number | null;
  setType?: SetType;
}): Promise<WorkoutTemplateSet> {
  const id = createUuid();
  const timestamp = nowUtc();

  await db.insert(workoutTemplateSets).values({
    id,
    templateExerciseId: input.templateExerciseId,
    orderIndex: input.orderIndex ?? 0,
    targetReps: input.targetReps ?? null,
    targetWeight: input.targetWeight ?? null,
    targetDurationSeconds: input.targetDurationSeconds ?? null,
    targetDistance: input.targetDistance ?? null,
    setType: input.setType ?? "normal",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const [row] = await db.select().from(workoutTemplateSets).where(eq(workoutTemplateSets.id, id)).limit(1);
  if (!row) throw new Error("Failed add template set");
  return row as WorkoutTemplateSet;
}

export async function updateTemplateSet(
  id: string,
  input: {
    orderIndex?: number;
    targetReps?: number | null;
    targetWeight?: number | null;
    targetDurationSeconds?: number | null;
    targetDistance?: number | null;
    setType?: SetType;
  },
): Promise<WorkoutTemplateSet | null> {
  await db
    .update(workoutTemplateSets)
    .set({
      ...(input.orderIndex !== undefined ? { orderIndex: input.orderIndex } : {}),
      ...(input.targetReps !== undefined ? { targetReps: input.targetReps } : {}),
      ...(input.targetWeight !== undefined ? { targetWeight: input.targetWeight } : {}),
      ...(input.targetDurationSeconds !== undefined
        ? { targetDurationSeconds: input.targetDurationSeconds }
        : {}),
      ...(input.targetDistance !== undefined ? { targetDistance: input.targetDistance } : {}),
      ...(input.setType !== undefined ? { setType: input.setType } : {}),
      updatedAt: nowUtc(),
    })
    .where(eq(workoutTemplateSets.id, id));

  const [row] = await db.select().from(workoutTemplateSets).where(eq(workoutTemplateSets.id, id)).limit(1);
  return (row as WorkoutTemplateSet | undefined) ?? null;
}

export async function deleteTemplateSet(id: string): Promise<void> {
  await db.delete(workoutTemplateSets).where(eq(workoutTemplateSets.id, id));
}
