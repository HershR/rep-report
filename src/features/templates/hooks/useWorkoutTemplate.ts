import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getWorkoutTemplateById,
  saveWorkoutTemplate,
} from "@/features/templates/repositories/templateRepository";
import type { WorkoutTemplateDraft } from "@/features/templates/types";

/** One template for the editor. With no id, `saveWorkoutTemplate` creates one. */
export function useWorkoutTemplate(templateId?: string) {
  const queryClient = useQueryClient();

  const templateQuery = useQuery({
    queryKey: ["workout-template", templateId],
    enabled: Boolean(templateId),
    queryFn: () => getWorkoutTemplateById(templateId as string),
  });

  const saveMutation = useMutation({
    mutationFn: (draft: WorkoutTemplateDraft) =>
      saveWorkoutTemplate(templateId ?? null, draft),
    onSuccess: async (savedId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["workout-templates"] }),
        queryClient.invalidateQueries({ queryKey: ["workout-template", savedId] }),
      ]);
    },
  });

  return {
    template: templateQuery.data ?? null,
    isLoading: templateQuery.isLoading,
    error: templateQuery.error ?? null,
    refetch: templateQuery.refetch,
    saveWorkoutTemplate: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
