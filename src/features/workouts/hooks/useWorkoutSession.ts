import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addExerciseToWorkout,
  addSetToWorkout,
  cancelWorkout,
  completeWorkout,
  removeExerciseFromWorkout,
  reorderWorkoutExercises,
  deleteSet,
  deleteWorkoutSession,
  getWorkoutSessionById,
  getWorkoutSessionDetailsById,
  updateCompletedWorkout,
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

  const invalidateHistoryForSession = async (id: string) => {
    const base = await getWorkoutSessionById(id);
    if (!base?.completedAt) return;
    const day = new Date(base.completedAt);
    const dateKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(
      day.getDate(),
    ).padStart(2, "0")}`;
    await queryClient.invalidateQueries({ queryKey: ["workout-history", dateKey] });
  };

  const addExerciseMutation = useMutation({
    mutationFn: (input: { exerciseId: string }) =>
      addExerciseToWorkout({ workoutSessionId: sessionId as string, exerciseId: input.exerciseId }),
    onSuccess: setCache,
  });

  const addSetMutation = useMutation({
    mutationFn: (input: { workoutSessionExerciseId: string } & WorkoutSetInput) => addSetToWorkout(input),
    onSuccess: (data) => {
      setCache(data);
      void queryClient.invalidateQueries({ queryKey: ["workout-history"] });
    },
  });

  const removeExerciseMutation = useMutation({
    mutationFn: (workoutSessionExerciseId: string) =>
      removeExerciseFromWorkout(sessionId as string, workoutSessionExerciseId),
    onSuccess: (data) => {
      setCache(data);
      void queryClient.invalidateQueries({ queryKey: ["workout-history"] });
    },
  });

  const reorderExercisesMutation = useMutation({
    mutationFn: (orderedExerciseIds: string[]) =>
      reorderWorkoutExercises(sessionId as string, orderedExerciseIds),
    onSuccess: (data) => {
      setCache(data);
      void queryClient.invalidateQueries({ queryKey: ["workout-history"] });
    },
  });

  const updateSetMutation = useMutation({
    mutationFn: (input: { setId: string } & WorkoutSetInput) => updateSet(input.setId, input),
    onSuccess: (data) => {
      setCache(data);
      void queryClient.invalidateQueries({ queryKey: ["workout-history"] });
    },
  });

  const deleteSetMutation = useMutation({
    mutationFn: (setId: string) => deleteSet(setId),
    onSuccess: (data) => {
      setCache(data);
      void queryClient.invalidateQueries({ queryKey: ["workout-history"] });
    },
  });

  const updateCompletedWorkoutMutation = useMutation({
    mutationFn: (input: {
      name?: string;
      notes?: string | null;
      completedAt?: string | null;
      durationSeconds?: number | null;
    }) => updateCompletedWorkout(sessionId as string, input),
    onSuccess: async (data) => {
      setCache(data);
      void queryClient.invalidateQueries({ queryKey: ["workout-history"] });
      if (sessionId) await invalidateHistoryForSession(sessionId);
    },
  });

  const deleteWorkoutSessionMutation = useMutation({
    mutationFn: () => deleteWorkoutSession(sessionId as string),
    onSuccess: async () => {
      queryClient.setQueryData(queryKey(sessionId), null);
      void queryClient.invalidateQueries({ queryKey: ["workout-history"] });
      if (sessionId) await invalidateHistoryForSession(sessionId);
    },
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
      if (sessionId) {
        void invalidateHistoryForSession(sessionId);
      }
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelWorkout(sessionId as string),
    onSuccess: () => {
      queryClient.setQueryData(["active-workout"], null);
      void queryClient.invalidateQueries({ queryKey: queryKey(sessionId) });
      if (sessionId) {
        void invalidateHistoryForSession(sessionId);
      }
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
    reorderExercises: reorderExercisesMutation.mutateAsync,
    updateSet: updateSetMutation.mutateAsync,
    deleteSet: deleteSetMutation.mutateAsync,
    updateCompletedWorkout: updateCompletedWorkoutMutation.mutateAsync,
    deleteWorkoutSession: deleteWorkoutSessionMutation.mutateAsync,
    completeWorkout: completeMutation.mutateAsync,
    cancelWorkout: cancelMutation.mutateAsync,
    isSaving:
      addExerciseMutation.isPending ||
      addSetMutation.isPending ||
      removeExerciseMutation.isPending ||
      reorderExercisesMutation.isPending ||
      updateSetMutation.isPending ||
      deleteSetMutation.isPending ||
      updateCompletedWorkoutMutation.isPending ||
      deleteWorkoutSessionMutation.isPending ||
      completeMutation.isPending ||
      cancelMutation.isPending,
  };
}
