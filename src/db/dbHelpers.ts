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
import { db } from "@/src/db/client";
//Get

export const getAllExercises = async (
  db: ExpoSQLiteDatabase<typeof schema>
) => {
  return db.select().from(exercises);
};
export const getExerciseById = async (id: number) => {
  return db.query.exercises.findFirst({
    where: eq(exercises.id, id),
  });
};

export const getFavoriteExercises = async () => {
  return db.query.exercises.findMany({
    where: eq(exercises.is_favorite, true),
    orderBy: (exercises, { desc }) => [desc(exercises.name)],
  });
};
export const getAllRoutines = async (db: ExpoSQLiteDatabase<typeof schema>) => {
  return db.select().from(routines);
};

export const getRoutineById = async (id: number) => {
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

export const getWorkoutsForRoutine = async (routineId: number) => {
  return db.query.workouts.findMany({
    where: eq(workouts.routine_id, routineId),
    with: {
      sets: true,
      exercise: true,
    },
  });
};

export const getWorkoutById = async (id: number) => {
  return db.query.workouts.findFirst({
    where: eq(workouts.id, id),
    with: {
      sets: true,
      exercise: true,
    },
  });
};
export const getWorkoutsByDate = async (
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
export const getRecentWorkouts = async (limit: number = 10) => {
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
export const getRecentWorkout = async (id: number) => {
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
export const createExercise = async (exercise: Exercise) => {
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

export const createRoutine = async ({
  name,
  description,
}: {
  name: string;
  description: string | null;
}) => {
  const now = new Date().toISOString();
  const result = await db
    .insert(routines)
    .values({
      name,
      description,
      date_created: now,
      last_updated: now,
    })
    .returning({ id: routines.id });

  return result[0]?.id;
};

export const addExerciseToRoutine = async (
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

export const createWorkout = async ({
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
}) => {
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
export const createWorkoutWithExercise = async ({
  date,
  mode,
  unit,
  routine_id,
  exercise_id,
  notes,
}: Workout) => {
  // Step 1: Check if exercise is in local DB
  const existing = await db.query.exercises.findFirst({
    where: eq(exercises.id, exercise_id),
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
        id: remoteExercise.id,
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
  return await createWorkout({
    date,
    mode,
    unit,
    routine_id,
    exercise_id: id!,
    notes,
  });
};

export const addSetsToWorkout = async (
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

export const addExercisesToRoutine = async (
  routineId: number,
  exercises: { id: number }[]
) => {
  const newSets: Omit<RoutineExercise, "id">[] = exercises.map((x, index) => {
    return {
      routine_id: routineId,
      exercise_id: x.id,
      order: index,
    };
  });
  return db.insert(routineExercises).values(newSets);
};

export const addDaysToRoutine = async (routineId: number, days: number[]) => {
  const routineDays: Omit<RoutineDay, "id">[] = days.map((x) => {
    return { routine_id: routineId, day: x };
  });

  return db.insert(schema.routineSchedule).values(routineDays);
};

//Update

export const setFavoriteExercise = async (
  exerciseId: number,
  isFavorite: boolean
) => {
  return db
    .update(exercises)
    .set({ is_favorite: isFavorite })
    .where(eq(exercises.id, exerciseId));
};

export const updateWorkoutWithSets = async (
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
  addSetsToWorkout(workoutId, workoutForm.sets);

  return workoutId;
};
export const updateRoutine = async (
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
  addExercisesToRoutine(routineId, routineForm.exercises);

  await db
    .delete(schema.routineSchedule)
    .where(eq(schema.routineSchedule.routine_id, routineId));
  addDaysToRoutine(
    routineId,
    routineForm.days.filter((x) => x.selected).map((y) => y.id)
  );
  return routineId;
};

//Delete

export const deleteRoutine = async (id: number) => {
  return db.delete(routines).where(eq(routines.id, id));
};

export const deleteWorkout = async (id: number) => {
  return db.delete(workouts).where(eq(workouts.id, id));
};

export const deleteWorkoutSet = async (id: number) => {
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
