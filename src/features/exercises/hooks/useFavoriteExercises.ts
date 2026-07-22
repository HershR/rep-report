import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createExercise,
  getFavoriteExerciseByWgerId,
  getFavoriteExercises,
  removeFavoriteExercise,
  saveFavoriteExercise,
  type CreateExerciseInput,
} from "@/features/exercises/repositories/exerciseRepository";
import type { ExerciseSearchResult } from "@/features/exercises/types";

export type CreateCustomExerciseInput = Omit<
  CreateExerciseInput,
  "source" | "wgerExerciseId" | "isFavorite"
>;

export function useFavoriteExercises() {
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ["favorite-exercises"],
    queryFn: getFavoriteExercises,
  });

  const saveMutation = useMutation({
    mutationFn: (exercise: ExerciseSearchResult) => saveFavoriteExercise(exercise),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["favorite-exercises"] });
      void queryClient.invalidateQueries({ queryKey: ["exercise-search"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (payload: { id?: string; wgerExerciseId?: number }) => removeFavoriteExercise(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["favorite-exercises"] });
      void queryClient.invalidateQueries({ queryKey: ["exercise-search"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateCustomExerciseInput) =>
      createExercise({ ...input, source: "custom", wgerExerciseId: null, isFavorite: true }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["favorite-exercises"] });
    },
  });

  return {
    favorites: favoritesQuery.data ?? [],
    isLoading: favoritesQuery.isLoading,
    error: favoritesQuery.error ?? null,
    refetch: favoritesQuery.refetch,
    saveFavoriteExercise: saveMutation.mutateAsync,
    removeFavoriteExercise: removeMutation.mutateAsync,
    createCustomExercise: createMutation.mutateAsync,
    getFavoriteExerciseByWgerId,
    isSaving: saveMutation.isPending,
    isRemoving: removeMutation.isPending,
    isCreating: createMutation.isPending,
  };
}
