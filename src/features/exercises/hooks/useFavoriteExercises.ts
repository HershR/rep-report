import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getFavoriteExerciseByWgerId,
  getFavoriteExercises,
  removeFavoriteExercise,
  saveFavoriteExercise,
} from "@/features/exercises/repositories/exerciseRepository";
import type { ExerciseSearchResult } from "@/features/exercises/types";

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

  return {
    favorites: favoritesQuery.data ?? [],
    isLoading: favoritesQuery.isLoading,
    error: favoritesQuery.error ?? null,
    refetch: favoritesQuery.refetch,
    saveFavoriteExercise: saveMutation.mutateAsync,
    removeFavoriteExercise: removeMutation.mutateAsync,
    getFavoriteExerciseByWgerId,
    isSaving: saveMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
