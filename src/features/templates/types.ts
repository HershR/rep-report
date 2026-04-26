import { z } from "zod";

import type { Exercise } from "@/features/exercises/types";

export type TemplateSetType = "normal" | "warmup" | "drop" | "failure";

export type WorkoutTemplateSet = {
  id: string;
  templateExerciseId: string;
  orderIndex: number;
  targetReps: number | null;
  targetWeight: number | null;
  targetDurationSeconds: number | null;
  setType: TemplateSetType;
  createdAt: string;
  updatedAt: string;
};

export type WorkoutTemplateExercise = {
  id: string;
  templateId: string;
  exerciseId: string;
  orderIndex: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  exercise: Exercise;
  sets: WorkoutTemplateSet[];
};

export type WorkoutTemplate = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  exercises: WorkoutTemplateExercise[];
};

export type CreateWorkoutTemplateInput = {
  name: string;
  description?: string | null;
};

export type UpdateWorkoutTemplateInput = {
  name?: string;
  description?: string | null;
};

export const templateNameSchema = z
  .string()
  .trim()
  .min(1, "Template name is required");

export const nonNegativeNumberSchema = z
  .union([z.number(), z.null()])
  .refine((value) => value === null || value >= 0, "Value must be 0 or greater");

export const templateSetSchema = z.object({
  targetReps: nonNegativeNumberSchema,
  targetWeight: nonNegativeNumberSchema,
  targetDurationSeconds: nonNegativeNumberSchema,
});
