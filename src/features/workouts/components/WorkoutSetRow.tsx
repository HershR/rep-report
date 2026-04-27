import { useEffect, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { CustomText } from "@/components/common";
import type { WorkoutSessionSet } from "@/features/workouts/types";
import { spacing, useThemeColors } from "@/theme";

type WorkoutSetRowProps = {
  index: number;
  workoutSet: WorkoutSessionSet;
  isCardio: boolean;
  onUpdate: (
    setId: string,
    input: {
      reps?: number | null;
      weight?: number | null;
      durationSeconds?: number | null;
      isCompleted?: boolean;
    },
  ) => void;
  onDelete: (setId: string) => void;
};

function toText(value: number | null): string {
  return value === null ? "" : String(value);
}

function toNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function WorkoutSetRow({
  index,
  workoutSet,
  isCardio,
  onUpdate,
  onDelete,
}: WorkoutSetRowProps) {
  const colors = useThemeColors();
  const isCompleted = workoutSet.isCompleted === 1;
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("0");
  const [seconds, setSeconds] = useState("0");

  useEffect(() => {
    const totalSeconds = workoutSet.durationSeconds ?? 0;
    const nextHours = Math.floor(totalSeconds / 3600);
    const nextMinutes = Math.floor((totalSeconds % 3600) / 60);
    const nextSeconds = totalSeconds % 60;
    setHours(String(nextHours));
    setMinutes(String(nextMinutes));
    setSeconds(String(nextSeconds));
  }, [workoutSet.durationSeconds, workoutSet.id]);

  const commitDuration = (
    nextHours: string,
    nextMinutes: string,
    nextSeconds: string,
  ) => {
    const parsedHours = Number(nextHours.trim() || "0");
    const parsedMinutes = Number(nextMinutes.trim() || "0");
    const parsedSeconds = Number(nextSeconds.trim() || "0");
    if (
      !Number.isFinite(parsedHours) ||
      !Number.isFinite(parsedMinutes) ||
      !Number.isFinite(parsedSeconds)
    ) {
      return;
    }
    const total = Math.max(
      0,
      Math.floor(parsedHours) * 3600 +
        Math.floor(parsedMinutes) * 60 +
        Math.floor(parsedSeconds),
    );
    onUpdate(workoutSet.id, { durationSeconds: total });
  };

  return (
    <View style={styles.row}>
      <CustomText muted style={styles.index}>{`#${index + 1}`}</CustomText>
      {isCardio ? (
        <>
          <TextInput
            value={hours}
            onChangeText={setHours}
            keyboardType="number-pad"
            placeholder="Hr"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.surface,
              },
            ]}
            onEndEditing={() => {
              commitDuration(hours, minutes, seconds);
            }}
          />
          <TextInput
            value={minutes}
            onChangeText={setMinutes}
            keyboardType="number-pad"
            placeholder="Min"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.surface,
              },
            ]}
            onEndEditing={() => {
              commitDuration(hours, minutes, seconds);
            }}
          />
          <TextInput
            value={seconds}
            onChangeText={setSeconds}
            keyboardType="number-pad"
            placeholder="Sec"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.surface,
              },
            ]}
            onEndEditing={() => {
              commitDuration(hours, minutes, seconds);
            }}
          />
        </>
      ) : (
        <>
          <TextInput
            defaultValue={toText(workoutSet.reps)}
            keyboardType="number-pad"
            placeholder="Reps"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.surface,
              },
            ]}
            onEndEditing={(event) => {
              onUpdate(workoutSet.id, {
                reps: toNumber(event.nativeEvent.text),
              });
            }}
          />
          <TextInput
            defaultValue={toText(workoutSet.weight)}
            keyboardType="decimal-pad"
            placeholder="Wt"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.surface,
              },
            ]}
            onEndEditing={(event) => {
              onUpdate(workoutSet.id, {
                weight: toNumber(event.nativeEvent.text),
              });
            }}
          />
        </>
      )}
      <Pressable
        onPress={() => onUpdate(workoutSet.id, { isCompleted: !isCompleted })}
      >
        <CustomText muted={!isCompleted}>
          {isCompleted ? "Done" : "Mark"}
        </CustomText>
      </Pressable>
      <Pressable onPress={() => onDelete(workoutSet.id)}>
        <CustomText muted>Del</CustomText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  index: {
    width: 28,
  },
  input: {
    borderWidth: 1,
    borderRadius: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    minWidth: 52,
  },
});
