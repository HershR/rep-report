import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteWorkoutSession,
  getWorkoutSessionDetailsById,
  saveCompletedWorkout,
  type CompletedWorkoutDraft,
} from "@/features/workouts/repositories/workoutRepository";
import { invalidateWorkoutDerivedQueries } from "@/features/workouts/hooks/invalidateWorkoutDerivedQueries";

function queryKey(sessionId?: string) {
  return ["workout-session", sessionId] as const;
}

/** A finished workout, for viewing and editing in history. */
export function useWorkoutSession(sessionId?: string) {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: queryKey(sessionId),
    enabled: Boolean(sessionId),
    queryFn: () => getWorkoutSessionDetailsById(sessionId as string),
  });

  const saveMutation = useMutation({
    mutationFn: (draft: CompletedWorkoutDraft) =>
      saveCompletedWorkout(sessionId as string, draft),
    onSuccess: async (data) => {
      queryClient.setQueryData(queryKey(sessionId), data);
      await invalidateWorkoutDerivedQueries(queryClient);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteWorkoutSession(sessionId as string),
    onSuccess: async () => {
      queryClient.setQueryData(queryKey(sessionId), null);
      await invalidateWorkoutDerivedQueries(queryClient);
    },
  });

  return {
    workoutSession: sessionQuery.data ?? null,
    isLoading: sessionQuery.isLoading,
    error: sessionQuery.error ?? null,
    refetch: sessionQuery.refetch,
    saveCompletedWorkout: saveMutation.mutateAsync,
    deleteWorkoutSession: deleteMutation.mutateAsync,
    isSaving: saveMutation.isPending || deleteMutation.isPending,
  };
}
