import { useQuery } from "@tanstack/react-query";
import { subMonths } from "date-fns";

import { getExerciseSessionSeries } from "@/features/personal-records/repositories/personalRecordsRepository";

/** Recent-window per-exercise progress series (last 3 months). */
export function useExerciseChart(exerciseId?: string) {
  return useQuery({
    queryKey: ["exercise-chart", exerciseId],
    enabled: Boolean(exerciseId),
    queryFn: () =>
      getExerciseSessionSeries(exerciseId as string, {
        since: subMonths(new Date(), 3).toISOString(),
      }),
  });
}
