import type { QueryClient } from "@tanstack/react-query";

/**
 * Every query whose answer is computed from completed workout history. Any
 * write that changes that history - finishing a workout, editing or deleting a
 * past one - refreshes them all through here, so a new derived view adds its
 * key once instead of at every write site.
 */
const WORKOUT_DERIVED_QUERY_KEYS = [
  ["workout-history"],
  ["workout-session"],
  ["workout-activity"],
  ["personal-records"],
  ["exercise-chart"],
  ["volume-trend"],
] as const;

export async function invalidateWorkoutDerivedQueries(
  queryClient: QueryClient,
): Promise<void> {
  await Promise.all(
    WORKOUT_DERIVED_QUERY_KEYS.map((queryKey) =>
      queryClient.invalidateQueries({ queryKey }),
    ),
  );
}
