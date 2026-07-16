import { StyleSheet } from "react-native";

import { CustomCard, CustomText } from "@/components/common";
import { spacing } from "@/theme";

type WorkoutTimerHeaderProps = {
  workoutName: string;
  elapsedSeconds: number;
};

function formatElapsed(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const remainingSeconds = clamped % 60;
  return [hours, minutes, remainingSeconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export function WorkoutTimerHeader({ workoutName, elapsedSeconds }: WorkoutTimerHeaderProps) {
  return (
    <CustomCard style={styles.card}>
      <CustomText variant="title">{workoutName}</CustomText>
      <CustomText muted>{`Elapsed ${formatElapsed(elapsedSeconds)}`}</CustomText>
    </CustomCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
});
