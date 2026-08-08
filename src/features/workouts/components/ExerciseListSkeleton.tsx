import { View } from "react-native";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading placeholder shaped like a list of `WorkoutExerciseBlock` rows
 * (exercise name, column header, then set rows). Shared by the active workout,
 * completed-workout detail, and template screens so all workout surfaces load
 * with one identical treatment instead of three different spinners.
 */
export function ExerciseListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <View className="gap-6">
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} className="gap-3">
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
        </View>
      ))}
    </View>
  );
}
