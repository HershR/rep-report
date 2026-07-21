import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getCompletedWorkoutDailyTotals } from "@/features/workouts/repositories/workoutRepository";
import { computeStreaks } from "@/features/workouts/utils/workoutStreak";

export function useWorkoutActivity() {
  const query = useQuery({
    queryKey: ["workout-activity"],
    queryFn: getCompletedWorkoutDailyTotals,
  });

  const dailyTotals = useMemo(() => query.data ?? [], [query.data]);
  const { current, best } = useMemo(
    () => computeStreaks(dailyTotals.map((day) => day.dateKey)),
    [dailyTotals],
  );

  return {
    dailyTotals,
    currentStreak: current,
    bestStreak: best,
    isLoading: query.isLoading,
    error: query.error ?? null,
  };
}
