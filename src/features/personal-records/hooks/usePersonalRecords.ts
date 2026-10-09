import { useQuery } from "@tanstack/react-query";

import {
  getAllPersonalRecords,
  getExercisePersonalRecords,
} from "@/features/personal-records/repositories/personalRecordsRepository";

export function usePersonalRecords() {
  const query = useQuery({
    queryKey: ["personal-records"],
    queryFn: getAllPersonalRecords,
  });

  return {
    records: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ?? null,
    refetch: query.refetch,
  };
}

export function useExercisePersonalRecords(exerciseId?: string) {
  const query = useQuery({
    queryKey: ["personal-records", exerciseId],
    enabled: Boolean(exerciseId),
    queryFn: () => getExercisePersonalRecords(exerciseId as string),
  });

  return {
    records: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ?? null,
  };
}
