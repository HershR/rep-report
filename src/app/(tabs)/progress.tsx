import { useRouter } from "expo-router";
import { format } from "date-fns";
import { ChevronRight, Flame } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { type ComponentProps, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Calendar } from "react-native-calendars";

import { CustomScreen } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import type { WeightUnit } from "@/db/schema";
import { VolumeTrendChart } from "@/features/charts/components/VolumeTrendChart";
import { usePersonalRecords } from "@/features/personal-records/hooks/usePersonalRecords";
import type { ExercisePersonalRecordsSummary } from "@/features/personal-records/types";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { useWorkoutActivity } from "@/features/workouts/hooks/useWorkoutActivity";
import { useWorkoutHistory } from "@/features/workouts/hooks/useWorkoutHistory";
import { THEME } from "@/lib/theme";
import { weightToText } from "@/lib/units";

type MarkedDates = NonNullable<ComponentProps<typeof Calendar>["markedDates"]>;

type ProgressTab = "history" | "trends" | "records";

/** Reformats a `"hsl(h s% l%)"` token into `"hsla(h, s%, l%, a)"` (legacy comma syntax). */
function withAlpha(hsl: string, alpha: number): string {
  const inner = hsl
    .replace(/^hsl\(/, "")
    .replace(/\)$/, "")
    .trim();
  const [h, s, l] = inner.split(/\s+/);
  return `hsla(${h}, ${s}, ${l}, ${alpha})`;
}

/** Exercises-per-day at which the calendar cell reaches full color intensity. */
const FULL_GRADIENT_EXERCISES = 10;
/** Floor so any activity day stays visible even with a single exercise. */
const MIN_ALPHA = 0.2;

function intensityAlpha(exerciseCount: number): number {
  const ratio =
    Math.min(exerciseCount, FULL_GRADIENT_EXERCISES) / FULL_GRADIENT_EXERCISES;
  return MIN_ALPHA + (1 - MIN_ALPHA) * ratio;
}

function headlineText(
  record: ExercisePersonalRecordsSummary,
  weightUnit: WeightUnit,
): string {
  if (record.heaviestWeight) {
    const weightText = `${weightToText(record.heaviestWeight.weight, weightUnit)} ${weightUnit}`;
    return record.heaviestWeight.reps !== null
      ? `${weightText} × ${record.heaviestWeight.reps}`
      : weightText;
  }
  if (record.mostReps) {
    return `${record.mostReps.reps} reps`;
  }
  return "—";
}

export default function ProgressScreen() {
  const router = useRouter();
  const { colorScheme: scheme } = useColorScheme();
  const colors = THEME[scheme ?? "light"];
  const [tab, setTab] = useState<ProgressTab>("history");

  const { selectedDate, selectedDateKey, setSelectedDate, workouts, isLoading } =
    useWorkoutHistory();
  const { dailyTotals, currentStreak, bestStreak } = useWorkoutActivity();
  const { appSettings } = useAppSettings();
  const weightUnit = appSettings?.weightUnit ?? "lb";
  const {
    records,
    isLoading: recordsLoading,
    error: recordsError,
    refetch: refetchRecords,
  } = usePersonalRecords();

  const markedDates = useMemo<MarkedDates>(() => {
    const marks: MarkedDates = {};
    for (const day of dailyTotals) {
      const alpha = intensityAlpha(day.exerciseCount);
      marks[day.dateKey] = {
        customStyles: {
          container: {
            backgroundColor: withAlpha(colors.primary, alpha),
            borderRadius: 16,
          },
          text: {
            color: alpha >= 0.5 ? colors.primaryForeground : colors.foreground,
          },
        },
      };
    }

    const existing = marks[selectedDateKey];
    marks[selectedDateKey] = {
      customStyles: {
        container: {
          ...(existing?.customStyles?.container ?? {}),
          borderWidth: 2,
          borderColor: colors.foreground,
          borderRadius: 16,
        },
        text: existing?.customStyles?.text ?? { color: colors.foreground },
      },
    };

    return marks;
  }, [dailyTotals, selectedDateKey, colors]);

  return (
    <CustomScreen scroll>
      <Text variant="h2">Progress</Text>
      <Text variant="muted">Look back at your training.</Text>

      <View className="mt-4 gap-4">
        <Card>
          <CardContent className="py-4">
            {currentStreak > 0 ? (
              <View className="flex-row items-center gap-3">
                <Icon as={Flame} size={24} color={colors.primary} />
                <View className="flex-1">
                  <Text variant="large">{`${currentStreak} day streak`}</Text>
                  {bestStreak > currentStreak ? (
                    <Text variant="muted" className="text-xs">
                      {`Best: ${bestStreak} days`}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : (
              <View className="flex-row items-center gap-3">
                <Icon as={Flame} size={24} className="text-muted-foreground" />
                <Text variant="muted" className="flex-1">
                  Complete a workout today to start your streak!
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={(value) => setTab(value as ProgressTab)}>
          <TabsList className="w-full">
            <TabsTrigger value="history" className="flex-1">
              <Text>History</Text>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex-1">
              <Text>Trends</Text>
            </TabsTrigger>
            <TabsTrigger value="records" className="flex-1">
              <Text>Records</Text>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {tab === "history" ? (
          <View className="gap-3">
            <Card>
              <CardContent>
                <Calendar
                  current={selectedDateKey}
                  markingType="custom"
                  onDayPress={(day) =>
                    setSelectedDate(new Date(`${day.dateString}T12:00:00`))
                  }
                  markedDates={markedDates}
                  theme={{
                    calendarBackground: colors.card,
                    dayTextColor: colors.foreground,
                    monthTextColor: colors.foreground,
                    textDisabledColor: colors.mutedForeground,
                    arrowColor: colors.primary,
                  }}
                />
              </CardContent>
            </Card>

            <Text variant="muted">{`Selected ${format(selectedDate, "PPP")}`}</Text>

            {isLoading ? (
              <Text variant="muted">Loading workouts...</Text>
            ) : null}

            {!isLoading && workouts.length === 0 ? (
              <Card>
                <CardContent>
                  <Text>No completed workouts on this date.</Text>
                </CardContent>
              </Card>
            ) : null}

            {!isLoading
              ? workouts.map((workout) => {
                  const setCount = workout.exercises.reduce(
                    (total, exercise) => total + exercise.sets.length,
                    0,
                  );
                  return (
                    <Pressable
                      key={workout.id}
                      className="active:opacity-80"
                      onPress={() =>
                        router.push({
                          pathname: "/workout/[workoutId]",
                          params: { workoutId: workout.id },
                        })
                      }
                    >
                      <Card>
                        <CardContent className="flex-row items-center gap-3">
                          <View className="flex-1 gap-2">
                            <Text>{workout.name}</Text>
                            <View className="flex-row flex-wrap gap-2">
                              <Badge variant="secondary">
                                <Text>{`${workout.exercises.length} exercises`}</Text>
                              </Badge>
                              <Badge variant="secondary">
                                <Text>{`${setCount} sets`}</Text>
                              </Badge>
                              <Badge variant="secondary">
                                <Text>{`${workout.durationSeconds ?? 0}s`}</Text>
                              </Badge>
                            </View>
                          </View>
                          <Icon
                            as={ChevronRight}
                            className="text-muted-foreground"
                          />
                        </CardContent>
                      </Card>
                    </Pressable>
                  );
                })
              : null}
          </View>
        ) : null}

        {tab === "trends" ? (
          <Card>
            <CardContent className="pt-6">
              <VolumeTrendChart />
            </CardContent>
          </Card>
        ) : null}

        {tab === "records" ? (
          <View className="gap-2">
            {recordsLoading ? (
              <View className="items-center py-4">
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : recordsError ? (
              <Card>
                <CardContent className="gap-2">
                  <Text className="text-destructive text-sm">
                    Could not load personal records.
                  </Text>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => void refetchRecords()}
                  >
                    <Text>Retry</Text>
                  </Button>
                </CardContent>
              </Card>
            ) : records.length === 0 ? (
              <Card>
                <CardContent>
                  <Text variant="muted">
                    Complete a workout to start tracking personal records.
                  </Text>
                </CardContent>
              </Card>
            ) : (
              records.map((record) => (
                <Pressable
                  key={record.exerciseId}
                  className="active:opacity-80"
                  onPress={() =>
                    router.push({
                      pathname: "/exercise/[exerciseId]",
                      params: {
                        exerciseId: record.exerciseId,
                        source: "local",
                      },
                    })
                  }
                >
                  <Card className="py-0">
                    <CardContent className="flex-row items-center gap-3 py-3">
                      <Text className="flex-1">{record.exerciseName}</Text>
                      <Text variant="muted">
                        {headlineText(record, weightUnit)}
                      </Text>
                      <Icon as={ChevronRight} className="text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Pressable>
              ))
            )}
          </View>
        ) : null}
      </View>
    </CustomScreen>
  );
}
