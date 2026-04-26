import { createExercise, getExerciseById, updateExercise } from "@/features/exercises/repositories/exerciseRepository";

export async function runDatabaseSmokeTest(): Promise<void> {
  const inserted = await createExercise({
    name: "Drizzle Smoke Exercise",
    source: "custom",
    isFavorite: false,
  });

  const fetched = await getExerciseById(inserted.id);
  if (!fetched) throw new Error("Smoke test failed: insert/read");

  const updated = await updateExercise(inserted.id, {
    name: "Drizzle Smoke Exercise Updated",
    isFavorite: true,
  });

  if (!updated || updated.name !== "Drizzle Smoke Exercise Updated" || updated.isFavorite !== 1) {
    throw new Error("Smoke test failed: update");
  }
}
