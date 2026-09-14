import { useQuery } from "@tanstack/react-query";
import { subMonths } from "date-fns";
import { useMemo } from "react";

import { getCompletedWorkoutVolumeTotals } from "@/features/workouts/repositories/workoutRepository";

/** Length of the charted window, in months. */
const WINDOW_MONTHS = 3;

/**
 * Training-volume-per-day for the recent window, plus the window before it so
 * the headline can say which way the trend is going. Both come from one query
 * over twice the span - the split is a filter, not a second round trip.
 */
export function useVolumeTrend() {
  const query = useQuery({
    queryKey: ["volume-trend"],
    queryFn: () =>
      getCompletedWorkoutVolumeTotals({
        since: subMonths(new Date(), WINDOW_MONTHS * 2).toISOString(),
      }),
  });

  const windows = useMemo(() => {
    const cutoff = subMonths(new Date(), WINDOW_MONTHS).getTime();
    const series = query.data ?? [];
    return {
      recent: series.filter((point) => point.t >= cutoff),
      previous: series.filter((point) => point.t < cutoff),
    };
  }, [query.data]);

  return {
    recent: windows.recent,
    previous: windows.previous,
    isLoading: query.isLoading,
  };
}
