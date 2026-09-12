import { ArrowUp } from "lucide-react-native";
import { View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import {
  WEEKLY_ACTIVITY_HOURS_GOAL,
  WEEKLY_EXERCISE_GOAL,
  useWeeklyProgress,
} from "@/features/workouts/hooks/useWeeklyProgress";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
const STRIP_HEIGHT = 40;
const REST_TICK = 4;

/** Trims a trailing ".0" so whole hours read "3h", partial reads "3.2h". */
function formatHours(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/** Monday-first index of today, matching the query's week bucketing. */
function todayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

export function WeeklyProgressCard() {
  const { exerciseCount, activitySeconds, dailySeconds } = useWeeklyProgress();
  const activityHours = activitySeconds / 3600;
  const today = todayIndex();
  const peak = Math.max(...dailySeconds, 1);
  const timeRatio = Math.min(
    1,
    Math.max(0, activityHours / WEEKLY_ACTIVITY_HOURS_GOAL),
  );

  return (
    <View className="border-border bg-card overflow-hidden rounded-lg border p-4">
      <View className="flex-row items-end justify-between">
        <View>
          <Text variant="sectionLabel">THIS WEEK</Text>
          <View className="mt-2 flex-row items-baseline gap-1.5">
            <Text variant="hero">{exerciseCount}</Text>
            <Text className="text-text-4 text-[17px] font-semibold">
              / {WEEKLY_EXERCISE_GOAL}
            </Text>
            <Text variant="microLabel" className="ml-1">
              EXERCISES
            </Text>
          </View>
        </View>
        {exerciseCount > 0 ? (
          <View className="bg-primary/10 flex-row items-center gap-1 rounded-full px-2.5 py-1.5">
            <Icon as={ArrowUp} className="text-primary size-3" />
            <Text variant="meta" className="text-primary">
              {exerciseCount}
            </Text>
          </View>
        ) : null}
      </View>

      {/* One bar per day: height is that day's active time, so the week
          reads as a shape rather than a number. */}
      <View
        className="mt-4 flex-row items-end gap-1.5"
        style={{ height: STRIP_HEIGHT }}
      >
        {dailySeconds.map((seconds, index) => {
          const trained = seconds > 0;
          const height = trained
            ? Math.max(10, (seconds / peak) * STRIP_HEIGHT)
            : REST_TICK;
          return (
            <View
              key={index}
              className={cn(
                "flex-1 rounded-sm",
                trained
                  ? "bg-primary"
                  : index <= today
                    ? "bg-border-strong"
                    : "bg-surface-inset",
              )}
              style={{ height }}
            />
          );
        })}
      </View>
      <View className="mt-2 flex-row gap-1.5">
        {DAY_LETTERS.map((letter, index) => (
          <Text
            key={index}
            variant="microLabel"
            className={cn(
              "flex-1 text-center",
              index === today
                ? "text-primary"
                : index > today
                  ? "text-text-4/60"
                  : undefined,
            )}
          >
            {letter}
          </Text>
        ))}
      </View>

      <View className="bg-border my-3.5 h-px" />

      <View className="flex-row items-center justify-between">
        <Text className="text-text-3 text-[13px]">Active time</Text>
        <Text variant="meta" className="text-foreground text-[13px]">
          {formatHours(activityHours)}h{" "}
          <Text variant="meta" className="text-text-4 text-[13px]">
            / {WEEKLY_ACTIVITY_HOURS_GOAL}h
          </Text>
        </Text>
      </View>
      <View className="bg-surface-raised mt-2 h-1.5 overflow-hidden rounded-full">
        <View
          className="bg-primary h-full rounded-full"
          style={{ width: `${timeRatio * 100}%` }}
        />
      </View>
    </View>
  );
}
