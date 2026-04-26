import { and, asc, eq, like } from "drizzle-orm";

import { db } from "@/db/client";
import { exercises } from "@/db/schema";
import { createUuid, nowUtc } from "@/db/utils";
import type { Exercise, ExerciseSearchResult } from "@/features/exercises/types";

type CreateExerciseInput = {
  name: string;
  wgerExerciseId?: number | null;
  description?: string | null;
  category?: string | null;
  equipment?: string[];
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  imageUrl?: string | null;
  isFavorite?: boolean;
  source?: "wger" | "custom";
};

function toJsonString(value: string[] | undefined): string | null {
  if (!value || value.length === 0) return null;
  return JSON.stringify(value);
}

function fromJsonString(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
    return [];
  } catch {
    return [];
  }
}

function mapRowToExercise(row: typeof exercises.$inferSelect): Exercise {
  return {
    id: row.id,
    wgerExerciseId: row.wgerExerciseId,
    name: row.name,
    description: row.description,
    category: row.category,
    equipment: fromJsonString(row.equipment),
    primaryMuscles: fromJsonString(row.primaryMuscles),
    secondaryMuscles: fromJsonString(row.secondaryMuscles),
    imageUrl: row.imageUrl,
    source: row.source as "wger" | "custom",
    isFavorite: row.isFavorite === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function createExercise(input: CreateExerciseInput): Promise<Exercise> {
  const id = createUuid();
  const timestamp = nowUtc();

  await db.insert(exercises).values({
    id,
    name: input.name,
    wgerExerciseId: input.wgerExerciseId ?? null,
    description: input.description ?? null,
    category: input.category ?? null,
    equipment: toJsonString(input.equipment),
    primaryMuscles: toJsonString(input.primaryMuscles),
    secondaryMuscles: toJsonString(input.secondaryMuscles),
    imageUrl: input.imageUrl ?? null,
    isFavorite: input.isFavorite ? 1 : 0,
    source: input.source ?? "wger",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const created = await getExerciseById(id);
  if (!created) throw new Error("Failed create exercise");
  return created;
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  const [row] = await db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
  return row ? mapRowToExercise(row) : null;
}

export async function listExercises(search?: string): Promise<Exercise[]> {
  if (!search?.trim()) {
    const rows = await db.select().from(exercises).orderBy(asc(exercises.name));
    return rows.map(mapRowToExercise);
  }

  const rows = await db
    .select()
    .from(exercises)
    .where(like(exercises.name, `%${search.trim()}%`))
    .orderBy(asc(exercises.name));

  return rows.map(mapRowToExercise);
}

export async function updateExercise(
  id: string,
  input: Partial<Omit<CreateExerciseInput, "name"> & { name: string }>,
): Promise<Exercise | null> {
  await db
    .update(exercises)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.wgerExerciseId !== undefined ? { wgerExerciseId: input.wgerExerciseId } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.equipment !== undefined ? { equipment: toJsonString(input.equipment) } : {}),
      ...(input.primaryMuscles !== undefined
        ? { primaryMuscles: toJsonString(input.primaryMuscles) }
        : {}),
      ...(input.secondaryMuscles !== undefined
        ? { secondaryMuscles: toJsonString(input.secondaryMuscles) }
        : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      ...(input.isFavorite !== undefined ? { isFavorite: input.isFavorite ? 1 : 0 } : {}),
      ...(input.source !== undefined ? { source: input.source } : {}),
      updatedAt: nowUtc(),
    })
    .where(eq(exercises.id, id));

  const updated = await getExerciseById(id);
  return updated;
}

export async function getFavoriteExerciseByWgerId(wgerExerciseId: number): Promise<Exercise | null> {
  const [row] = await db
    .select()
    .from(exercises)
    .where(and(eq(exercises.wgerExerciseId, wgerExerciseId), eq(exercises.isFavorite, 1)))
    .limit(1);

  return row ? mapRowToExercise(row) : null;
}

export async function saveFavoriteExercise(input: ExerciseSearchResult): Promise<Exercise> {
  const existing = await db
    .select()
    .from(exercises)
    .where(eq(exercises.wgerExerciseId, input.wgerExerciseId))
    .limit(1);

  const timestamp = nowUtc();
  const row = existing[0];
  if (row) {
    await db
      .update(exercises)
      .set({
        name: input.name,
        description: input.description,
        category: input.category,
        equipment: toJsonString(input.equipment),
        primaryMuscles: toJsonString(input.primaryMuscles),
        secondaryMuscles: toJsonString(input.secondaryMuscles),
        imageUrl: input.imageUrl,
        source: "wger",
        isFavorite: 1,
        updatedAt: timestamp,
      })
      .where(eq(exercises.id, row.id));

    const updated = await getExerciseById(row.id);
    if (!updated) throw new Error("Failed update favorite exercise");
    return updated;
  }

  return createExercise({
    name: input.name,
    wgerExerciseId: input.wgerExerciseId,
    description: input.description,
    category: input.category,
    equipment: input.equipment,
    primaryMuscles: input.primaryMuscles,
    secondaryMuscles: input.secondaryMuscles,
    imageUrl: input.imageUrl,
    isFavorite: true,
    source: "wger",
  });
}

export async function removeFavoriteExercise(input: { id?: string; wgerExerciseId?: number }): Promise<void> {
  if (input.id) {
    await db
      .update(exercises)
      .set({ isFavorite: 0, updatedAt: nowUtc() })
      .where(eq(exercises.id, input.id));
    return;
  }

  if (input.wgerExerciseId !== undefined) {
    await db
      .update(exercises)
      .set({ isFavorite: 0, updatedAt: nowUtc() })
      .where(eq(exercises.wgerExerciseId, input.wgerExerciseId));
  }
}

export async function getFavoriteExercises(): Promise<Exercise[]> {
  const rows = await db
    .select()
    .from(exercises)
    .where(eq(exercises.isFavorite, 1))
    .orderBy(asc(exercises.name));

  return rows.map(mapRowToExercise);
}

export async function isExerciseFavorited(wgerExerciseId: number): Promise<boolean> {
  const favorite = await getFavoriteExerciseByWgerId(wgerExerciseId);
  return Boolean(favorite);
}
