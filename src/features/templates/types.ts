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

export type TemplateEditorSet = {
  id?: string;
  localId: string;
  repsText: string;
  weightText: string;
  durationText: string;
};

export type TemplateEditorExercise = {
  id?: string;
  localId: string;
  exerciseId: string;
  exerciseName: string;
  exerciseCategory: string | null;
  orderIndex: number;
  sets: TemplateEditorSet[];
};

export type TemplateEditorFormValues = {
  name: string;
  description: string;
  exercises: TemplateEditorExercise[];
};

export type TemplateEditorValue = {
  name: string;
  description: string | null;
  exercises: TemplateEditorExercise[];
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

const optionalNonNegativeTextSchema = z
  .string()
  .refine((value) => {
    const trimmed = value.trim();
    if (!trimmed) return true;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) && parsed >= 0;
  }, "Value must be 0 or greater");

export const templateEditorSetSchema = z.object({
  id: z.string().optional(),
  localId: z.string(),
  repsText: optionalNonNegativeTextSchema,
  weightText: optionalNonNegativeTextSchema,
  durationText: optionalNonNegativeTextSchema,
});

export const templateEditorExerciseSchema = z.object({
  id: z.string().optional(),
  localId: z.string(),
  exerciseId: z.string().min(1),
  exerciseName: z.string().min(1),
  exerciseCategory: z.string().nullable(),
  orderIndex: z.number().int().min(0),
  sets: z.array(templateEditorSetSchema),
});

export const templateEditorFormSchema = z.object({
  name: templateNameSchema,
  description: z.string(),
  exercises: z.array(templateEditorExerciseSchema),
});

export function parseTemplateNumberText(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}
