import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addExerciseToTemplate,
  addSetToTemplateExercise,
  deleteTemplateSet,
  getWorkoutTemplateById,
  removeExerciseFromTemplate,
  updateTemplateExercise,
  updateTemplateSet,
  updateWorkoutTemplate,
} from "@/features/templates/repositories/templateRepository";
import type { UpdateWorkoutTemplateInput } from "@/features/templates/types";

export function useWorkoutTemplate(templateId?: string) {
  const queryClient = useQueryClient();

  const templateQuery = useQuery({
    queryKey: ["workout-template", templateId],
    enabled: Boolean(templateId),
    queryFn: () => getWorkoutTemplateById(templateId as string),
  });

  const invalidateTemplateQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["workout-templates"] }),
      queryClient.invalidateQueries({ queryKey: ["workout-template", templateId] }),
    ]);
  };

  const updateTemplateMutation = useMutation({
    mutationFn: (input: UpdateWorkoutTemplateInput) => updateWorkoutTemplate(templateId as string, input),
    onSuccess: () => {
      void invalidateTemplateQueries();
    },
  });

  const addExerciseMutation = useMutation({
    mutationFn: (input: { exerciseId: string; orderIndex?: number; notes?: string | null }) =>
      addExerciseToTemplate({
        templateId: templateId as string,
        exerciseId: input.exerciseId,
        orderIndex: input.orderIndex,
        notes: input.notes,
      }),
    onSuccess: () => {
      void invalidateTemplateQueries();
    },
  });

  const removeExerciseMutation = useMutation({
    mutationFn: (templateExerciseId: string) => removeExerciseFromTemplate(templateExerciseId),
    onSuccess: () => {
      void invalidateTemplateQueries();
    },
  });

  const updateExerciseMutation = useMutation({
    mutationFn: (input: { templateExerciseId: string; orderIndex?: number; notes?: string | null }) =>
      updateTemplateExercise(input.templateExerciseId, {
        orderIndex: input.orderIndex,
        notes: input.notes,
      }),
    onSuccess: () => {
      void invalidateTemplateQueries();
    },
  });

  const addSetMutation = useMutation({
    mutationFn: (input: {
      templateExerciseId: string;
      orderIndex?: number;
      targetReps?: number | null;
      targetWeight?: number | null;
      targetDurationSeconds?: number | null;
      setType?: "normal" | "warmup" | "drop" | "failure";
    }) => addSetToTemplateExercise(input),
    onSuccess: () => {
      void invalidateTemplateQueries();
    },
  });

  const updateSetMutation = useMutation({
    mutationFn: (input: {
      templateSetId: string;
      orderIndex?: number;
      targetReps?: number | null;
      targetWeight?: number | null;
      targetDurationSeconds?: number | null;
      setType?: "normal" | "warmup" | "drop" | "failure";
    }) =>
      updateTemplateSet(input.templateSetId, {
        orderIndex: input.orderIndex,
        targetReps: input.targetReps,
        targetWeight: input.targetWeight,
        targetDurationSeconds: input.targetDurationSeconds,
        setType: input.setType,
      }),
    onSuccess: () => {
      void invalidateTemplateQueries();
    },
  });

  const deleteSetMutation = useMutation({
    mutationFn: (templateSetId: string) => deleteTemplateSet(templateSetId),
    onSuccess: () => {
      void invalidateTemplateQueries();
    },
  });

  return {
    template: templateQuery.data ?? null,
    isLoading: templateQuery.isLoading,
    error: templateQuery.error ?? null,
    refetch: templateQuery.refetch,
    updateWorkoutTemplate: updateTemplateMutation.mutateAsync,
    addExerciseToTemplate: addExerciseMutation.mutateAsync,
    removeExerciseFromTemplate: removeExerciseMutation.mutateAsync,
    updateTemplateExercise: updateExerciseMutation.mutateAsync,
    addSetToTemplateExercise: addSetMutation.mutateAsync,
    updateTemplateSet: updateSetMutation.mutateAsync,
    deleteTemplateSet: deleteSetMutation.mutateAsync,
    isSaving:
      updateTemplateMutation.isPending ||
      addExerciseMutation.isPending ||
      removeExerciseMutation.isPending ||
      updateExerciseMutation.isPending ||
      addSetMutation.isPending ||
      updateSetMutation.isPending ||
      deleteSetMutation.isPending,
  };
}
