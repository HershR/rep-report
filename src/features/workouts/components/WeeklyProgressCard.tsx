import { View } from "react-native";

import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import {
  WEEKLY_ACTIVITY_HOURS_GOAL,
  WEEKLY_EXERCISE_GOAL,
  useWeeklyProgress,
} from "@/features/workouts/hooks/useWeeklyProgress";

/** Trims a trailing ".0" so whole hours read "3 hrs", partial reads "3.2 hrs". */
function formatHours(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function GoalBar({
  label,
  valueText,
  ratio,
}: {
  label: string;
  valueText: string;
  ratio: number;
}) {
  const pct = Math.min(1, Math.max(0, ratio)) * 100;
  return (
    <View className="gap-1.5">
      <View className="flex-row items-center justify-between">
        <Text variant="small">{label}</Text>
        <Text variant="muted" className="text-xs">
          {valueText}
        </Text>
      </View>
      <View className="bg-muted h-3 overflow-hidden rounded-full">
        <View
          className="bg-primary h-full rounded-full"
          style={{ width: `${pct}%` }}
        />
      </View>
    </View>
  );
}

export function WeeklyProgressCard() {
  const { exerciseCount, activitySeconds } = useWeeklyProgress();
  const activityHours = activitySeconds / 3600;

  return (
    <Card>
      <CardContent className="gap-4 py-4">
        <Text variant="large">This week</Text>
        <GoalBar
          label="Exercises"
          valueText={`${exerciseCount} / ${WEEKLY_EXERCISE_GOAL}`}
          ratio={exerciseCount / WEEKLY_EXERCISE_GOAL}
        />
        <GoalBar
          label="Active time"
          valueText={`${formatHours(activityHours)} / ${WEEKLY_ACTIVITY_HOURS_GOAL} hrs`}
          ratio={activityHours / WEEKLY_ACTIVITY_HOURS_GOAL}
        />
      </CardContent>
    </Card>
  );
}
