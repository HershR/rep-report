import { useQuery } from "@tanstack/react-query";

import { getCurrentWeekProgress } from "@/features/workouts/repositories/workoutRepository";

/** Weekly goals (Monday-start week). */
export const WEEKLY_EXERCISE_GOAL = 6;
export const WEEKLY_ACTIVITY_HOURS_GOAL = 7;

export function useWeeklyProgress() {
  // Keyed under the "workout-activity" namespace so the existing
  // `invalidateQueries(["workout-activity"])` calls on workout completion
  // refresh this via React Query's prefix matching — no extra invalidations.
  const query = useQuery({
    queryKey: ["workout-activity", "current-week"],
    queryFn: getCurrentWeekProgress,
  });

  return {
    exerciseCount: query.data?.exerciseCount ?? 0,
    activitySeconds: query.data?.activitySeconds ?? 0,
    dailySeconds: query.data?.dailySeconds ?? [0, 0, 0, 0, 0, 0, 0],
    isLoading: query.isLoading,
  };
}
