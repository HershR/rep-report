import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getCompletedWorkoutDailyTotals } from "@/features/workouts/repositories/workoutRepository";

export function useWorkoutActivity() {
  const query = useQuery({
    queryKey: ["workout-activity"],
    queryFn: getCompletedWorkoutDailyTotals,
  });

  const dailyTotals = useMemo(() => query.data ?? [], [query.data]);

  return {
    dailyTotals,
    isLoading: query.isLoading,
    error: query.error ?? null,
  };
}
