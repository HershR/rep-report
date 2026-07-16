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

export type WorkoutDetailFormSet = WorkoutSessionSet;

export type WorkoutDetailFormExercise = WorkoutSessionExerciseWithDetails;

export type WorkoutDetailFormValues = {
  name: string;
  notes: string;
  completedAt: string | null;
  exercises: WorkoutDetailFormExercise[];
};

export const workoutSetValueSchema = z
  .union([z.number(), z.null()])
  .refine((value) => value === null || value >= 0, "Value must be 0 or greater");

export const workoutDetailSetSchema = z.object({
  id: z.string(),
  workoutSessionExerciseId: z.string(),
  orderIndex: z.number().int().min(0),
  reps: workoutSetValueSchema,
  weight: workoutSetValueSchema,
  durationSeconds: workoutSetValueSchema,
  distance: workoutSetValueSchema,
  isCompleted: z.number().int().min(0).max(1),
  setType: z.custom<SetType>(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const workoutDetailExerciseSchema = z.object({
  id: z.string(),
  workoutSessionId: z.string(),
  exerciseId: z.string(),
  orderIndex: z.number().int().min(0),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  exercise: z.custom<Exercise>(),
  sets: z.array(workoutDetailSetSchema),
});

export const workoutDetailFormSchema = z.object({
  name: z.string().trim().min(1, "Workout name is required"),
  notes: z.string(),
  completedAt: z.string().nullable(),
  exercises: z.array(workoutDetailExerciseSchema),
});
