import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteWorkoutTemplate,
  getWorkoutTemplates,
} from "@/features/templates/repositories/templateRepository";

export function useWorkoutTemplates() {
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ["workout-templates"],
    queryFn: getWorkoutTemplates,
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
    deleteWorkoutTemplate: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
