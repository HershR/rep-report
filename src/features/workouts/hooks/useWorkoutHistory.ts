import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import { getCompletedWorkoutsByDate } from "@/features/workouts/repositories/workoutRepository";

function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function useWorkoutHistory() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const selectedDateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);

  const historyQuery = useQuery({
    queryKey: ["workout-history", selectedDateKey],
    queryFn: () => getCompletedWorkoutsByDate(selectedDateKey),
  });

  return {
    selectedDate,
    selectedDateKey,
    setSelectedDate,
    workouts: historyQuery.data ?? [],
    isLoading: historyQuery.isLoading,
    error: historyQuery.error ?? null,
    refetch: historyQuery.refetch,
  };
}
