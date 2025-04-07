// dbHelpers.ts
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";

import {
  workoutRoutines,
  routineExercises,
  workouts,
  workoutSets,
  exercises,
} from "./schema";
import { eq } from "drizzle-orm";
import { fetchExerciseDetail } from "../services/api";

//Get

export const getAllRoutines = async (db: ExpoSQLiteDatabase<typeof schema>) => {
  return db.select().from(workoutRoutines);
};

export const getRoutineById = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  id: number
) => {
  return db.query.workoutRoutines.findFirst({
    where: eq(workoutRoutines.id, id),
    with: {
      routineExercises: {
        with: {
          exercise: true,
        },
      },
    },
  });
};

export const getWorkoutsForRoutine = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  routineId: number
) => {
  return db.query.workouts.findMany({
    where: eq(workouts.collection_id, routineId),
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
  date: string
) => {
  return db.query.workouts.findMany({
    where: eq(workouts.date, date),
    with: {
      sets: true,
      exercise: true,
    },
  });
};
export const getRecentWorkouts = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  limit: number = 10
) => {
  return db.query.workouts.findMany({
    orderBy: (workouts, { desc }) => [desc(workouts.date)],
    limit,
    with: {
      exercise: true,
    },
  });
};
//Create
export const createRoutine = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  name: string
) => {
  const now = new Date().toISOString();
  const result = await db
    .insert(workoutRoutines)
    .values({
      name,
      date_created: now,
      last_updated: now,
    })
    .returning({ id: workoutRoutines.id });

  return result[0]?.id;
};

export const addExerciseToRoutine = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  routineId: number,
  exerciseId: number,
  order: number
) => {
  return db.insert(routineExercises).values({
    routine_id: routineId,
    exercise_id: exerciseId,
    order,
  });
};

export const createWorkout = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  {
    date,
    mode,
    collection_id,
    exercise_id,
    notes,
  }: {
    date: string;
    mode: 0 | 1;
    collection_id: number;
    exercise_id: number;
    notes?: string;
  }
) => {
  const result = await db
    .insert(workouts)
    .values({ date, mode, collection_id, exercise_id, notes })
    .returning({ id: workouts.id });

  return result[0]?.id;
};
export const createWorkoutWithExercise = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  {
    date,
    mode,
    collection_id,
    exercise_id,
  }: {
    date: string;
    mode: 0 | 1;
    collection_id?: number;
    exercise_id: number;
  }
) => {
  // Step 1: Check if exercise is in local DB
  const existing = await db.query.exercises.findFirst({
    where: eq(exercises.wger_id, exercise_id),
  });
  let id = existing?.id;
  // Step 2: If not, fetch from Wger
  if (!existing) {
    const remoteExercise = await fetchExerciseDetail(exercise_id.toString());
    if (!remoteExercise) throw new Error("Exercise not found from Wger");

    // Step 3: Insert into local DB
    const result = await db
      .insert(exercises)
      .values({
        wger_id: remoteExercise.id,
        name: remoteExercise.translations.find((x) => x.language == 2)!.name,
        category: remoteExercise.category.name,
        image:
          remoteExercise.images.length == 0
            ? null
            : remoteExercise.images[0].image,
      })
      .returning({ id: exercises.id });
    id = result[0]?.id;
  }
  // Step 4: Insert workout
  const result = await db
    .insert(workouts)
    .values({ date, mode, collection_id, exercise_id: id! })
    .returning({ id: workouts.id });

  return result[0]?.id;
};
export const addSetToWorkout = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  {
    workout_id,
    order,
    reps,
    weight,
    duration,
    notes,
  }: {
    workout_id: number;
    order: number;
    reps?: number;
    weight?: number;
    duration?: string;
    notes?: string;
  }
) => {
  return db.insert(workoutSets).values({
    workout_id,
    order,
    reps,
    weight,
    duration,
    notes,
  });
};

//Update
export const updateRoutineName = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  id: number,
  newName: string
) => {
  return db
    .update(workoutRoutines)
    .set({ name: newName, last_updated: new Date().toISOString() })
    .where(eq(workoutRoutines.id, id));
};

export const updateWorkoutNote = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  id: number,
  note: string
) => {
  return db.update(workouts).set({ notes: note }).where(eq(workouts.id, id));
};

//Delete

export const deleteRoutine = async (
  db: ExpoSQLiteDatabase<typeof schema>,
  id: number
) => {
  return db.delete(workoutRoutines).where(eq(workoutRoutines.id, id));
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
