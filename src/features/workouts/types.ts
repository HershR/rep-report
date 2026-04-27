import { z } from "zod";

import type { SetType, WorkoutSession, WorkoutSessionExercise, WorkoutSet } from "@/db/schema";
import type { Exercise } from "@/features/exercises/types";

export type WorkoutSetInput = {
  reps?: number | null;
  weight?: number | null;
  durationSeconds?: number | null;
  distance?: number | null;
  isCompleted?: boolean;
  setType?: SetType;
};

export type WorkoutSessionSet = WorkoutSet;

export type WorkoutSessionExerciseWithDetails = WorkoutSessionExercise & {
  exercise: Exercise;
  sets: WorkoutSessionSet[];
};

export type WorkoutSessionDetails = WorkoutSession & {
  exercises: WorkoutSessionExerciseWithDetails[];
};

export const workoutSetValueSchema = z
  .union([z.number(), z.null()])
  .refine((value) => value === null || value >= 0, "Value must be 0 or greater");
