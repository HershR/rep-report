import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addExerciseToWorkout,
  addSetToWorkout,
  cancelWorkout,
  deleteSet,
  finishWorkout,
  getActiveWorkoutSession,
  removeExerciseFromWorkout,
  renameWorkoutSession,
  repeatWorkout,
  startWorkout,
  updateSet,
} from "@/features/workouts/repositories/workoutRepository";
import { invalidateWorkoutDerivedQueries } from "@/features/workouts/hooks/invalidateWorkoutDerivedQueries";
import type { WorkoutSetInput } from "@/features/workouts/types";

const ACTIVE_WORKOUT_QUERY_KEY = ["active-workout"] as const;

export function useActiveWorkout() {
  const queryClient = useQueryClient();

  const activeQuery = useQuery({
    queryKey: ACTIVE_WORKOUT_QUERY_KEY,
    queryFn: getActiveWorkoutSession,
  });

  const setActiveWorkoutCache = (data: Awaited<ReturnType<typeof getActiveWorkoutSession>>) => {
    queryClient.setQueryData(ACTIVE_WORKOUT_QUERY_KEY, data);
  };

  const startMutation = useMutation({
    mutationFn: (input?: { name?: string; templateId?: string | null; notes?: string | null }) =>
      startWorkout(input),
    onSuccess: (data) => {
      setActiveWorkoutCache(data);
    },
  });

  const repeatMutation = useMutation({
    mutationFn: (sourceSessionId: string) => repeatWorkout(sourceSessionId),
    onSuccess: (data) => {
      setActiveWorkoutCache(data);
    },
  });

  const finishMutation = useMutation({
    mutationFn: (input: { sessionId: string; discardUnlogged: boolean }) =>
      finishWorkout(input.sessionId, { discardUnlogged: input.discardUnlogged }),
    onSuccess: async (outcome) => {
      setActiveWorkoutCache(null);
      // A discarded workout never reached history, so nothing derived changed.
      if (outcome === "completed") await invalidateWorkoutDerivedQueries(queryClient);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (sessionId: string) => cancelWorkout(sessionId),
    onSuccess: () => {
      setActiveWorkoutCache(null);
    },
  });

  const renameMutation = useMutation({
    mutationFn: (input: { sessionId: string; name: string }) =>
      renameWorkoutSession(input.sessionId, input.name),
    onSuccess: (data) => {
      setActiveWorkoutCache(data);
    },
  });

  const addExerciseMutation = useMutation({
    mutationFn: (input: { workoutSessionId: string; exerciseId: string }) => addExerciseToWorkout(input),
    onSuccess: (data) => {
      setActiveWorkoutCache(data);
    },
  });

  const addSetMutation = useMutation({
    mutationFn: (input: { workoutSessionExerciseId: string } & WorkoutSetInput) => addSetToWorkout(input),
    onSuccess: (data) => {
      setActiveWorkoutCache(data);
    },
  });

  const removeExerciseMutation = useMutation({
    mutationFn: (input: { workoutSessionId: string; workoutSessionExerciseId: string }) =>
      removeExerciseFromWorkout(input.workoutSessionId, input.workoutSessionExerciseId),
    onSuccess: (data) => {
      setActiveWorkoutCache(data);
    },
  });

  const updateSetMutation = useMutation({
    mutationFn: (input: { setId: string } & WorkoutSetInput) => updateSet(input.setId, input),
    onSuccess: (data) => {
      setActiveWorkoutCache(data);
    },
  });

  const deleteSetMutation = useMutation({
    mutationFn: (setId: string) => deleteSet(setId),
    onSuccess: (data) => {
      setActiveWorkoutCache(data);
    },
  });

  return {
    activeWorkout: activeQuery.data ?? null,
    isLoading: activeQuery.isLoading,
    /**
     * Whether the active-workout lookup has actually answered. Callers must not read
     * `activeWorkout === null` as "there is no workout" until this is true — while the
     * query is still in flight the value is also null.
     */
    isLoaded: activeQuery.isSuccess,
    error: activeQuery.error ?? null,
    refetch: activeQuery.refetch,
    startWorkout: startMutation.mutateAsync,
    repeatWorkout: repeatMutation.mutateAsync,
    renameWorkout: renameMutation.mutateAsync,
    finishWorkout: finishMutation.mutateAsync,
    cancelWorkout: cancelMutation.mutateAsync,
    addExerciseToWorkout: addExerciseMutation.mutateAsync,
    addSetToWorkout: addSetMutation.mutateAsync,
    removeExerciseFromWorkout: removeExerciseMutation.mutateAsync,
    updateSet: updateSetMutation.mutateAsync,
    deleteSet: deleteSetMutation.mutateAsync,
    isSaving:
      startMutation.isPending ||
      repeatMutation.isPending ||
      renameMutation.isPending ||
      finishMutation.isPending ||
      cancelMutation.isPending ||
      addExerciseMutation.isPending ||
      addSetMutation.isPending ||
      removeExerciseMutation.isPending ||
      updateSetMutation.isPending ||
      deleteSetMutation.isPending,
  };
}
