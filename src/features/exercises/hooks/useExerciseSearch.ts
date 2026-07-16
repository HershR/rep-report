import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import type { ExerciseFilters } from "@/features/exercises/types";
import { getFavoriteExercises } from "@/features/exercises/repositories/exerciseRepository";
import { searchWgerExercises } from "@/services/wger/client";

type UseExerciseSearchResult = {
  debouncedQuery: string;
  items: Awaited<ReturnType<typeof searchWgerExercises>>["items"];
  total: number;
  nextPage: number | null;
  previousPage: number | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useExerciseSearch(filters: ExerciseFilters): UseExerciseSearchResult {
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query?.trim() ?? "");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(filters.query?.trim() ?? "");
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.query]);

  const query = useQuery({
    queryKey: [
      "exercise-search",
      debouncedQuery,
      filters.page ?? 1,
      filters.limit ?? 20,
      filters.categoryIds ?? [],
      filters.equipmentIds ?? [],
      filters.muscleIds ?? [],
    ],
    queryFn: async () => {
      const [remote, favorites] = await Promise.all([
        searchWgerExercises({
          query: debouncedQuery,
          page: filters.page ?? 1,
          limit: filters.limit ?? 20,
          categoryIds: filters.categoryIds,
          equipmentIds: filters.equipmentIds,
          muscleIds: filters.muscleIds,
        }),
        getFavoriteExercises(),
      ]);

      const favoriteIds = new Set(
        favorites.map((item) => item.wgerExerciseId).filter((item): item is number => item !== null),
      );

      return {
        ...remote,
        items: remote.items.map((item) => ({
          ...item,
          isFavorite: favoriteIds.has(item.wgerExerciseId),
        })),
      };
    },
    staleTime: 30_000,
  });

  const data = useMemo(
    () =>
      query.data ?? {
        items: [],
        total: 0,
        nextPage: null,
        previousPage: null,
      },
    [query.data],
  );

  return {
    debouncedQuery,
    items: data.items,
    total: data.total,
    nextPage: data.nextPage,
    previousPage: data.previousPage,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error ?? null,
    refetch: () => {
      void query.refetch();
    },
  };
}
