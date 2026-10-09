import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { bucketByWeek, weeklyVolumeSince } from "@/features/charts/weeklyVolume";
import { getCompletedWorkoutVolumeTotals } from "@/features/workouts/repositories/workoutRepository";

export const WEEKLY_VOLUME_WEEKS = 8;

/**
 * Training volume per week for the last eight weeks, plus the eight before for
 * the trend. One query over both windows; the split is a bucketing step.
 *
 * Kept under the "volume-trend" key so `invalidateWorkoutDerivedQueries`
 * refreshes it after every finished or edited workout.
 */
export function useWeeklyVolume() {
  const query = useQuery({
    queryKey: ["volume-trend", "weekly", WEEKLY_VOLUME_WEEKS],
    queryFn: () =>
      getCompletedWorkoutVolumeTotals({
        since: weeklyVolumeSince(new Date(), WEEKLY_VOLUME_WEEKS).toISOString(),
      }),
  });

  const volume = useMemo(
    () => bucketByWeek(query.data ?? [], new Date(), WEEKLY_VOLUME_WEEKS),
    [query.data],
  );

  return {
    ...volume,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
