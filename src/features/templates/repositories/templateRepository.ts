import { asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db/client";
import { chunk, createUuid, nowUtc } from "@/db/utils";
import {
  exercises,
  workoutTemplateSets,
  workoutTemplateExercises,
  workoutTemplates,
} from "@/db/schema";
import type {
  WorkoutTemplate,
  WorkoutTemplateDraft,
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

export async function getWorkoutTemplateById(id: string): Promise<WorkoutTemplate | null> {
  return hydrateTemplate(id);
}

export async function getWorkoutTemplates(): Promise<WorkoutTemplate[]> {
  const rows = await db.select().from(workoutTemplates).orderBy(asc(workoutTemplates.name));
  const templates = await Promise.all(rows.map((row) => hydrateTemplate(row.id)));
  return templates.filter((template): template is WorkoutTemplate => Boolean(template));
}

export async function deleteWorkoutTemplate(id: string): Promise<void> {
  await db.delete(workoutTemplates).where(eq(workoutTemplates.id, id));
}

/**
 * Creates (`templateId` null) or overwrites a template in one transaction: the
 * template row, then its exercises and target sets replaced wholesale from the
 * draft, in draft order. Returns the template id.
 *
 * Replacing rather than diffing is safe because nothing references a
 * template-exercise or template-set id - sessions point at the template itself.
 * Rows that survive the edit keep their id and `createdAt`, plus the fields the
 * editor does not show (exercise notes, set type), so editing a template can
 * never quietly turn a warmup target into a working set.
 */
export async function saveWorkoutTemplate(
  templateId: string | null,
  draft: WorkoutTemplateDraft,
): Promise<string> {
  const id = templateId ?? createUuid();
  const timestamp = nowUtc();

  const existingExercises = templateId
    ? await db
        .select({
          id: workoutTemplateExercises.id,
          createdAt: workoutTemplateExercises.createdAt,
          notes: workoutTemplateExercises.notes,
        })
        .from(workoutTemplateExercises)
        .where(eq(workoutTemplateExercises.templateId, templateId))
    : [];
  const existingSets =
    existingExercises.length > 0
      ? await db
          .select({
            id: workoutTemplateSets.id,
            createdAt: workoutTemplateSets.createdAt,
            setType: workoutTemplateSets.setType,
          })
          .from(workoutTemplateSets)
          .where(
            inArray(
              workoutTemplateSets.templateExerciseId,
              existingExercises.map((row) => row.id),
            ),
          )
      : [];
  const exerciseById = new Map(existingExercises.map((row) => [row.id, row] as const));
  const setById = new Map(existingSets.map((row) => [row.id, row] as const));

  const exerciseRows: (typeof workoutTemplateExercises.$inferInsert)[] = [];
  const setRows: (typeof workoutTemplateSets.$inferInsert)[] = [];
  for (const [exerciseIndex, exercise] of draft.exercises.entries()) {
    const kept = exercise.id !== null ? exerciseById.get(exercise.id) : undefined;
    const exerciseRowId = kept?.id ?? createUuid();
    exerciseRows.push({
      id: exerciseRowId,
      templateId: id,
      exerciseId: exercise.exerciseId,
      orderIndex: exerciseIndex,
      notes: kept?.notes ?? null,
      createdAt: kept?.createdAt ?? timestamp,
      updatedAt: timestamp,
    });
    for (const [setIndex, set] of exercise.sets.entries()) {
      const keptSet = set.id !== null ? setById.get(set.id) : undefined;
      setRows.push({
        id: keptSet?.id ?? createUuid(),
        templateExerciseId: exerciseRowId,
        orderIndex: setIndex,
        targetReps: set.targetReps,
        targetWeight: set.targetWeight,
        targetDurationSeconds: set.targetDurationSeconds,
        targetDistance: set.targetDistance,
        setType: keptSet?.setType ?? "normal",
        createdAt: keptSet?.createdAt ?? timestamp,
        updatedAt: timestamp,
      });
    }
  }

  // `db.transaction` on expo-sqlite is synchronous and commits when this
  // callback returns, so nothing in here may await.
  db.transaction((tx) => {
    if (templateId) {
      const existing = tx
        .select({ id: workoutTemplates.id })
        .from(workoutTemplates)
        .where(eq(workoutTemplates.id, templateId))
        .get();
      if (!existing) throw new Error("Template not found");
      tx.update(workoutTemplates)
        .set({
          name: draft.name.trim(),
          description: draft.description,
          updatedAt: timestamp,
        })
        .where(eq(workoutTemplates.id, templateId))
        .run();
      // Cascades to the template sets.
      tx.delete(workoutTemplateExercises)
        .where(eq(workoutTemplateExercises.templateId, templateId))
        .run();
    } else {
      tx.insert(workoutTemplates)
        .values({
          id,
          name: draft.name.trim(),
          description: draft.description,
          createdAt: timestamp,
          updatedAt: timestamp,
        })
        .run();
    }
    for (const batch of chunk(exerciseRows)) {
      tx.insert(workoutTemplateExercises).values(batch).run();
    }
    for (const batch of chunk(setRows)) {
      tx.insert(workoutTemplateSets).values(batch).run();
    }
  });

  return id;
}
