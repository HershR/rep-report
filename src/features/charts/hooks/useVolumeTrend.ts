import { useQuery } from "@tanstack/react-query";
import { subMonths } from "date-fns";

import { getCompletedWorkoutVolumeTotals } from "@/features/workouts/repositories/workoutRepository";

/** Recent-window training-volume-per-day series (last 3 months). */
export function useVolumeTrend() {
  return useQuery({
    queryKey: ["volume-trend"],
    queryFn: () =>
      getCompletedWorkoutVolumeTotals({
        since: subMonths(new Date(), 3).toISOString(),
      }),
  });
}
