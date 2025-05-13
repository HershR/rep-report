// dbHelpers.ts
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";

import {
  routines,
  routineExercises,
  workouts,
  workoutSets,
  exercises,
} from "./schema";
import { eq, sql } from "drizzle-orm";
import { fetchExerciseDetail } from "../services/api";
import { RoutineFormField as RoutineFormFields } from "../components/RoutineForm";

//Get

export const getAllExercises = async (
  db: ExpoSQLiteDatabase<typeof schema>
) => {
  return db.select().from(exercises);
};

export const getExerciseById = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  id: number
) => {
  return db.query.exercises.findFirst({
    where: eq(exercises.id, id),
  });
};
export const getOrCreateExercise = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  exercise_id: number
): Promise<number> => {
  const existing = await db.query.exercises.findFirst({
    where: eq(exercises.id, exercise_id),
  });
  let id = existing?.id;
  // Step 2: If not, fetch from Wger
  if (!existing) {
    const remoteExercise = await fetchExerciseDetail(exercise_id.toString());
    if (!remoteExercise) throw new Error("Exercise not found from Wger");

    const exercise = {
      id: remoteExercise.id,
      name: remoteExercise.translations.find((x) => x.language == 2)!.name,
      category: remoteExercise.category.name,
      image:
        remoteExercise.images.length == 0
          ? null
          : remoteExercise.images[0].image,
      is_favorite: false,
    };
    // Step 3: Insert into local DB
    return await createExercise(db, exercise);
  }
  return id!;
};

export const getFavoriteExercises = async (
  db: ExpoSQLiteDatabase<typeof schema>
) => {
  return db.query.exercises.findMany({
    where: eq(exercises.is_favorite, true),
    orderBy: (exercises, { desc }) => [desc(exercises.name)],
  });
};

export const getAllRoutines = async (db: ExpoSQLiteDatabase<typeof schema>) => {
  return db.select().from(routines);
};

export const getRoutineById = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  id: number
) => {
  return db.query.routines.findFirst({
    where: eq(routines.id, id),
    with: {
      routineExercises: {
        with: {
          exercise: true,
        },
      },
      routineSchedule: true,
    },
  });
};

export const getWorkoutsForRoutine = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  routineId: number
) => {
  return db.query.workouts.findMany({
    where: eq(workouts.routine_id, routineId),
    with: {
      sets: true,
      exercise: true,
    },
  });
};

export const getWorkoutById = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  id: number
) => {
  return db.query.workouts.findFirst({
    where: eq(workouts.id, id),
    with: {
      sets: true,
      exercise: true,
    },
  });
};
export const getWorkoutsByDate = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  date: string,
  includeSets: boolean = false
) => {
  return db.query.workouts.findMany({
    where: eq(workouts.date, date),
    with: {
      exercise: true,
      ...(includeSets ? { sets: true } : {}),
    },
  });
};
export const getRecentWorkouts = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  limit: number = 10
) => {
  return db.query.workouts.findMany({
    orderBy: (workouts, { desc }) => [
      desc(workouts.last_updated),
      desc(workouts.id),
    ],
    limit,
    with: {
      exercise: true,
    },
  });
};
export const getRecentWorkout = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  id: number
) => {
  return db.query.workouts.findFirst({
    orderBy: (workouts, { desc }) => [desc(workouts.date)],
    where: eq(workouts.exercise_id, id),
    with: {
      exercise: true,
      sets: true,
    },
  });
};

//Create
const createExercise = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  exercise: Exercise
) => {
  const result = await db
    .insert(exercises)
    .values({
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      image: exercise.image || null,
      is_favorite: exercise.is_favorite || false,
    })
    .returning({ id: exercises.id });
  return result[0]?.id;
};

export const createRoutine = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  { name, description }: { name: string; description: string | null }
) => {
  const now = new Date().toISOString();
  const result = await db
    .insert(routines)
    .values({
      name,
      description: description,
      date_created: now,
      last_updated: now,
    })
    .returning({ id: routines.id });

  return result[0]?.id;
};

const createWorkout = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  {
    date,
    mode,
    unit,
    notes,
    routine_id,
    exercise_id,
  }: {
    date: string;
    mode: number;
    unit: string; // e.g., kg, lbs
    notes: string | null;
    routine_id: number | null;
    exercise_id: number;
  }
) => {
  const now = new Date().toISOString();
  const result = await db
    .insert(workouts)
    .values({
      date,
      mode,
      unit,
      routine_id,
      exercise_id,
      notes,
      last_updated: now,
      date_created: now,
    })
    .returning({ id: workouts.id });

  return result[0]?.id;
};
export const createWorkoutWithExercise = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  { date, mode, unit, routine_id, exercise_id, notes }: Workout
) => {
  //Check if exercise is in local DB
  const id = await getOrCreateExercise(db, exercise_id);
  return await createWorkout(db, {
    date,
    mode,
    unit,
    routine_id,
    exercise_id: id,
    notes,
  });
};

export const addSetsToWorkout = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  workout_id: number,
  sets: Omit<WorkoutSet, "id">[]
) => {
  const newSets = sets.map((set, index) => ({
    workout_id,
    order: index,
    reps: set.reps,
    weight: set.weight,
    duration: set.duration,
  }));
  return db.insert(workoutSets).values(newSets);
};
export const addExerciseToRoutine = async (
  db: ExpoSQLiteDatabase<typeof schema>,

  routineId: number,
  exerciseId: number,
  order: number
) => {
  const id = await getOrCreateExercise(db, exerciseId);
  return db.insert(routineExercises).values({
    routine_id: routineId,
    exercise_id: id!,
    order,
  });
};
export const addExercisesToRoutine = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  routineId: number,
  exercises: { id: number }[]
) => {
  for (let index = 0; index < exercises.length; index++) {
    await addExerciseToRoutine(db, routineId, exercises[index].id, index);
  }
};

export const addDaysToRoutine = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  routineId: number,
  days: number[]
) => {
  if (days.length == 0) {
    return;
  }
  const routineDays: Omit<RoutineDay, "id">[] = days.map((x) => {
    return { routine_id: routineId, day: x };
  });

  return db.insert(schema.routineSchedule).values(routineDays);
};

//Update

export const setFavoriteExercise = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  exerciseId: number,
  isFavorite: boolean
) => {
  return db
    .update(exercises)
    .set({ is_favorite: isFavorite })
    .where(eq(exercises.id, exerciseId));
};

export const updateWorkoutWithSets = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  workoutId: number,
  workoutForm: Omit<Workout, "exercise_id"> // assume exercise can't be changed
) => {
  await db
    .update(workouts)
    .set({
      date: workoutForm.date,
      mode: workoutForm.mode,
      routine_id: workoutForm.routine_id,
      notes: workoutForm.notes,
      last_updated: new Date().toISOString(),
    })
    .where(eq(workouts.id, workoutId));

  // Step 2: Delete old sets
  await db.delete(workoutSets).where(eq(workoutSets.workout_id, workoutId));
  addSetsToWorkout(db, workoutId, workoutForm.sets);

  return workoutId;
};
export const updateRoutine = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  routineId: number,
  routineForm: RoutineFormFields
) => {
  await db
    .update(routines)
    .set({
      name: routineForm.name,
      description: routineForm.description,
      last_updated: new Date().toISOString(),
    })
    .where(eq(routines.id, routineId));

  // Step 2: Delete old routines
  await db
    .delete(routineExercises)
    .where(eq(routineExercises.routine_id, routineId));
  addExercisesToRoutine(db, routineId, routineForm.exercises);

  await db
    .delete(schema.routineSchedule)
    .where(eq(schema.routineSchedule.routine_id, routineId));
  addDaysToRoutine(
    db,
    routineId,
    routineForm.days.filter((x) => x.selected).map((y) => y.id)
  );
  return routineId;
};

//Delete

export const deleteRoutine = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  id: number
) => {
  return db.delete(routines).where(eq(routines.id, id));
};

export const deleteWorkout = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  id: number
) => {
  return db.delete(workouts).where(eq(workouts.id, id));
};

export const deleteWorkoutSet = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  id: number
) => {
  return db.delete(workoutSets).where(eq(workoutSets.id, id));
};

//Reset

export async function resetDatebase(db: ExpoSQLiteDatabase<typeof schema>) {
  try {
    db.run(sql`DROP TABLE IF EXISTS routine_exercises`);
    db.run(sql`DROP TABLE IF EXISTS workout_routines`);
    db.run(sql`DROP TABLE IF EXISTS workout_sets`);
    db.run(sql`DROP TABLE IF EXISTS workouts`);
    db.run(sql`DROP TABLE IF EXISTS exercises`);
    db.run(sql`DROP TABLE IF EXISTS _drizzle_migrations`);
    console.log("Database cleared!");
  } catch (error) {
    console.error("Error clearing database:", error);
  }
}
