import { asc, eq, like } from "drizzle-orm";

import { db } from "@/db/client";
import { createUuid, nowUtc } from "@/db/utils";
import { exercises, type Exercise } from "@/db/schema";

export type CreateExerciseInput = {
  name: string;
  wgerExerciseId?: number | null;
  description?: string | null;
  category?: string | null;
  equipment?: string | null;
  primaryMuscles?: string | null;
  secondaryMuscles?: string | null;
  imageUrl?: string | null;
  isFavorite?: boolean;
  source?: "wger" | "custom";
};

export async function createExercise(input: CreateExerciseInput): Promise<Exercise> {
  const id = createUuid();
  const timestamp = nowUtc();

  await db.insert(exercises).values({
    id,
    name: input.name,
    wgerExerciseId: input.wgerExerciseId ?? null,
    description: input.description ?? null,
    category: input.category ?? null,
    equipment: input.equipment ?? null,
    primaryMuscles: input.primaryMuscles ?? null,
    secondaryMuscles: input.secondaryMuscles ?? null,
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
  return row ?? null;
}

export async function listExercises(search?: string): Promise<Exercise[]> {
  if (!search?.trim()) return db.select().from(exercises).orderBy(asc(exercises.name));
  return db
    .select()
    .from(exercises)
    .where(like(exercises.name, `%${search.trim()}%`))
    .orderBy(asc(exercises.name));
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
      ...(input.equipment !== undefined ? { equipment: input.equipment } : {}),
      ...(input.primaryMuscles !== undefined ? { primaryMuscles: input.primaryMuscles } : {}),
      ...(input.secondaryMuscles !== undefined ? { secondaryMuscles: input.secondaryMuscles } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      ...(input.isFavorite !== undefined ? { isFavorite: input.isFavorite ? 1 : 0 } : {}),
      ...(input.source !== undefined ? { source: input.source } : {}),
      updatedAt: nowUtc(),
    })
    .where(eq(exercises.id, id));

  return getExerciseById(id);
}
