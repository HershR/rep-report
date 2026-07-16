import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";

import { CustomCard, CustomScreen, CustomText } from "@/components/common";
import { useWorkoutHistory } from "@/features/workouts/hooks/useWorkoutHistory";
import { spacing, useThemeColors } from "@/theme";

export default function DashboardScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { selectedDate, selectedDateKey, setSelectedDate, workouts, isLoading } = useWorkoutHistory();

  return (
    <CustomScreen scroll>
      <CustomText variant="title">Dashboard</CustomText>
      <CustomText muted style={styles.subtitle}>
        Workout history by date.
      </CustomText>

      <View style={styles.gap}>
        <CustomCard>
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
              calendarBackground: colors.surface,
              dayTextColor: colors.text,
              monthTextColor: colors.text,
              textDisabledColor: colors.textMuted,
              arrowColor: colors.primary,
            }}
          />
        </CustomCard>

        <CustomText muted>{`Selected ${format(selectedDate, "PPP")}`}</CustomText>

        {isLoading ? <CustomText muted>Loading workouts...</CustomText> : null}

        {!isLoading && workouts.length === 0 ? (
          <CustomCard>
            <CustomText>No completed workouts on this date.</CustomText>
          </CustomCard>
        ) : null}

        {!isLoading
          ? workouts.map((workout) => (
              <CustomCard key={workout.id} style={styles.card}>
                <CustomText>{workout.name}</CustomText>
                <CustomText muted>
                  {`${workout.exercises.length} exercises • ${workout.exercises.reduce(
                    (total, exercise) => total + exercise.sets.length,
                    0,
                  )} sets`}
                </CustomText>
                <CustomText muted>{`Duration ${workout.durationSeconds ?? 0}s`}</CustomText>
                <CustomText
                  muted
                  onPress={() =>
                    router.push({
                      pathname: "/workout/[workoutId]",
                      params: { workoutId: workout.id },
                    })
                  }
                >
                  Open details
                </CustomText>
              </CustomCard>
            ))
          : null}
      </View>
    </CustomScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: spacing.xs },
  gap: { marginTop: spacing.lg, gap: spacing.sm },
  card: { gap: spacing.xs },
});
