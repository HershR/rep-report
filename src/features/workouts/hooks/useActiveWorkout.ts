import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addExerciseToWorkout,
  addSetToWorkout,
  cancelWorkout,
  completeWorkout,
  removeExerciseFromWorkout,
  removeIncompleteSets,
  deleteSet,
  getActiveWorkoutSession,
  repeatWorkout,
  resumeWorkout,
  startWorkout,
  updateSet,
} from "@/features/workouts/repositories/workoutRepository";
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

  const resumeMutation = useMutation({
    mutationFn: (sessionId?: string) => resumeWorkout(sessionId),
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

  const completeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const active = await getActiveWorkoutSession();
      const completedAt = new Date().toISOString();
      const durationSeconds = active
        ? Math.max(0, Math.floor((Date.parse(completedAt) - Date.parse(active.startedAt)) / 1000))
        : null;
      return completeWorkout(sessionId, { completedAt, durationSeconds });
    },
    onSuccess: () => {
      setActiveWorkoutCache(null);
      void queryClient.invalidateQueries({ queryKey: ["workout-history"] });
      void queryClient.invalidateQueries({ queryKey: ["personal-records"] });
      void queryClient.invalidateQueries({ queryKey: ["workout-activity"] });
      void queryClient.invalidateQueries({ queryKey: ["exercise-chart"] });
      void queryClient.invalidateQueries({ queryKey: ["volume-trend"] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (sessionId: string) => cancelWorkout(sessionId),
    onSuccess: () => {
      setActiveWorkoutCache(null);
      void queryClient.invalidateQueries({ queryKey: ["workout-history"] });
      void queryClient.invalidateQueries({ queryKey: ["personal-records"] });
      void queryClient.invalidateQueries({ queryKey: ["workout-activity"] });
      void queryClient.invalidateQueries({ queryKey: ["exercise-chart"] });
      void queryClient.invalidateQueries({ queryKey: ["volume-trend"] });
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

  const removeIncompleteSetsMutation = useMutation({
    mutationFn: (sessionId: string) => removeIncompleteSets(sessionId),
    onSuccess: (data) => {
      setActiveWorkoutCache(data);
    },
  });

  return {
    activeWorkout: activeQuery.data ?? null,
    isLoading: activeQuery.isLoading,
    error: activeQuery.error ?? null,
    refetch: activeQuery.refetch,
    startWorkout: startMutation.mutateAsync,
    resumeWorkout: resumeMutation.mutateAsync,
    repeatWorkout: repeatMutation.mutateAsync,
    completeWorkout: completeMutation.mutateAsync,
    cancelWorkout: cancelMutation.mutateAsync,
    addExerciseToWorkout: addExerciseMutation.mutateAsync,
    addSetToWorkout: addSetMutation.mutateAsync,
    removeExerciseFromWorkout: removeExerciseMutation.mutateAsync,
    updateSet: updateSetMutation.mutateAsync,
    deleteSet: deleteSetMutation.mutateAsync,
    removeIncompleteSets: removeIncompleteSetsMutation.mutateAsync,
    isSaving:
      startMutation.isPending ||
      resumeMutation.isPending ||
      repeatMutation.isPending ||
      completeMutation.isPending ||
      cancelMutation.isPending ||
      addExerciseMutation.isPending ||
      addSetMutation.isPending ||
      removeExerciseMutation.isPending ||
      updateSetMutation.isPending ||
      deleteSetMutation.isPending ||
      removeIncompleteSetsMutation.isPending,
  };
}
