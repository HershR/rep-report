import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createWorkoutTemplate,
  deleteWorkoutTemplate,
  getWorkoutTemplates,
} from "@/features/templates/repositories/templateRepository";
import type { CreateWorkoutTemplateInput } from "@/features/templates/types";

export function useWorkoutTemplates() {
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ["workout-templates"],
    queryFn: getWorkoutTemplates,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateWorkoutTemplateInput) => createWorkoutTemplate(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workout-templates"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (templateId: string) => deleteWorkoutTemplate(templateId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workout-templates"] });
    },
  });

  return {
    templates: templatesQuery.data ?? [],
    isLoading: templatesQuery.isLoading,
    error: templatesQuery.error ?? null,
    refetch: templatesQuery.refetch,
    createWorkoutTemplate: createMutation.mutateAsync,
    deleteWorkoutTemplate: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
