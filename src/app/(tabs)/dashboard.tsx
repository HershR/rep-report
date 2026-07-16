import { useRouter } from "expo-router";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react-native";
import { Pressable, useColorScheme, View } from "react-native";
import { Calendar } from "react-native-calendars";

import { CustomScreen } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useWorkoutHistory } from "@/features/workouts/hooks/useWorkoutHistory";
import { THEME } from "@/lib/theme";

export default function DashboardScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = THEME[scheme ?? "light"];
  const { selectedDate, selectedDateKey, setSelectedDate, workouts, isLoading } = useWorkoutHistory();

  return (
    <CustomScreen scroll>
      <Text variant="h2">Dashboard</Text>
      <Text variant="muted">Workout history by date.</Text>

      <View className="mt-6 gap-3">
        <Card>
          <CardContent>
            <Calendar
              current={selectedDateKey}
              onDayPress={(day) => setSelectedDate(new Date(`${day.dateString}T12:00:00`))}
              markedDates={{
                [selectedDateKey]: {
                  selected: true,
                  selectedColor: colors.primary,
                },
              }}
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
                0
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
                      <Icon as={ChevronRight} className="text-muted-foreground" />
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
