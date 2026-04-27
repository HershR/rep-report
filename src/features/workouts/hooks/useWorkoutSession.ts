import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addExerciseToWorkout,
  addSetToWorkout,
  cancelWorkout,
  completeWorkout,
  removeExerciseFromWorkout,
  deleteSet,
  getWorkoutSessionDetailsById,
  updateSet,
} from "@/features/workouts/repositories/workoutRepository";
import type { WorkoutSetInput } from "@/features/workouts/types";

function queryKey(sessionId?: string) {
  return ["workout-session", sessionId] as const;
}

export function useWorkoutSession(sessionId?: string) {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: queryKey(sessionId),
    enabled: Boolean(sessionId),
    queryFn: () => getWorkoutSessionDetailsById(sessionId as string),
  });

  const setCache = (data: Awaited<ReturnType<typeof getWorkoutSessionDetailsById>>) => {
    queryClient.setQueryData(queryKey(sessionId), data);
    if (data?.status === "active") {
      queryClient.setQueryData(["active-workout"], data);
    }
  };

  const addExerciseMutation = useMutation({
    mutationFn: (input: { exerciseId: string }) =>
      addExerciseToWorkout({ workoutSessionId: sessionId as string, exerciseId: input.exerciseId }),
    onSuccess: setCache,
  });

  const addSetMutation = useMutation({
    mutationFn: (input: { workoutSessionExerciseId: string } & WorkoutSetInput) => addSetToWorkout(input),
    onSuccess: setCache,
  });

  const removeExerciseMutation = useMutation({
    mutationFn: (workoutSessionExerciseId: string) =>
      removeExerciseFromWorkout(sessionId as string, workoutSessionExerciseId),
    onSuccess: setCache,
  });

  const updateSetMutation = useMutation({
    mutationFn: (input: { setId: string } & WorkoutSetInput) => updateSet(input.setId, input),
    onSuccess: setCache,
  });

  const deleteSetMutation = useMutation({
    mutationFn: (setId: string) => deleteSet(setId),
    onSuccess: setCache,
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      const session = await getWorkoutSessionDetailsById(sessionId as string);
      if (!session) return null;
      const completedAt = new Date().toISOString();
      const durationSeconds = Math.max(
        0,
        Math.floor((Date.parse(completedAt) - Date.parse(session.startedAt)) / 1000),
      );
      return completeWorkout(session.id, { completedAt, durationSeconds });
    },
    onSuccess: () => {
      queryClient.setQueryData(["active-workout"], null);
      void queryClient.invalidateQueries({ queryKey: queryKey(sessionId) });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelWorkout(sessionId as string),
    onSuccess: () => {
      queryClient.setQueryData(["active-workout"], null);
      void queryClient.invalidateQueries({ queryKey: queryKey(sessionId) });
    },
  });

  return {
    workoutSession: sessionQuery.data ?? null,
    isLoading: sessionQuery.isLoading,
    error: sessionQuery.error ?? null,
    refetch: sessionQuery.refetch,
    addExerciseToWorkout: addExerciseMutation.mutateAsync,
    addSetToWorkout: addSetMutation.mutateAsync,
    removeExerciseFromWorkout: removeExerciseMutation.mutateAsync,
    updateSet: updateSetMutation.mutateAsync,
    deleteSet: deleteSetMutation.mutateAsync,
    completeWorkout: completeMutation.mutateAsync,
    cancelWorkout: cancelMutation.mutateAsync,
    isSaving:
      addExerciseMutation.isPending ||
      addSetMutation.isPending ||
      removeExerciseMutation.isPending ||
      updateSetMutation.isPending ||
      deleteSetMutation.isPending ||
      completeMutation.isPending ||
      cancelMutation.isPending,
  };
}
