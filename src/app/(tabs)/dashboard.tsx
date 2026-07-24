import { useRouter } from "expo-router";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { type ComponentProps, useMemo } from "react";
import { Pressable, View } from "react-native";
import { Calendar } from "react-native-calendars";

type MarkedDates = NonNullable<ComponentProps<typeof Calendar>["markedDates"]>;

import { CustomScreen } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VolumeTrendChart } from "@/features/charts/components/VolumeTrendChart";
import { useWorkoutActivity } from "@/features/workouts/hooks/useWorkoutActivity";
import { useWorkoutHistory } from "@/features/workouts/hooks/useWorkoutHistory";
import { THEME } from "@/lib/theme";

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

export default function DashboardScreen() {
  const router = useRouter();
  const { colorScheme: scheme } = useColorScheme();
  const colors = THEME[scheme ?? "light"];
  const {
    selectedDate,
    selectedDateKey,
    setSelectedDate,
    workouts,
    isLoading,
  } = useWorkoutHistory();
  const { dailyTotals } = useWorkoutActivity();

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
      <Text variant="h2">Dashboard</Text>
      <Text variant="muted">Workout history by date.</Text>

      <View className="mt-6 gap-3">
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

        <Card>
          <CardContent className="pt-6">
            <VolumeTrendChart />
          </CardContent>
        </Card>

        <Text variant="muted">{`Selected ${format(selectedDate, "PPP")}`}</Text>

        {isLoading ? <Text variant="muted">Loading workouts...</Text> : null}

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
    </CustomScreen>
  );
}
