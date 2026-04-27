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

function formatDurationInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 6);
  if (digits.length === 0) return "";
  const padded = digits.padStart(6, "0");
  const hh = Number(padded.slice(0, 2));
  const mm = Number(padded.slice(2, 4));
  const ss = Number(padded.slice(4, 6));
  if (hh > 0) return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  if (mm > 0) return `${mm}:${String(ss).padStart(2, "0")}`;
  return String(ss);
}

function secondsToFormatted(value: number | null): string {
  if (value === null || value === 0) return "";
  const safe = Math.max(0, Math.floor(value));
  const hh = Math.floor(safe / 3600);
  const mm = Math.floor((safe % 3600) / 60);
  const ss = safe % 60;
  if (hh > 0) return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  if (mm > 0) return `${mm}:${String(ss).padStart(2, "0")}`;
  return String(ss);
}

function formattedToSeconds(value: string): number {
  const digits = value.replace(/\D/g, "").slice(0, 6).padStart(6, "0");
  const hh = Number(digits.slice(0, 2));
  const mm = Number(digits.slice(2, 4));
  const ss = Number(digits.slice(4, 6));
  return hh * 3600 + mm * 60 + ss;
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
  const [durationInput, setDurationInput] = useState("");

  useEffect(() => {
    setDurationInput(secondsToFormatted(workoutSet.durationSeconds));
  }, [workoutSet.durationSeconds, workoutSet.id]);

  return (
    <View style={styles.row}>
      <CustomText muted style={styles.index}>{`#${index + 1}`}</CustomText>
      {isCardio ? (
        <>
          <TextInput
            value={durationInput}
            onChangeText={(value) => setDurationInput(formatDurationInput(value))}
            keyboardType="number-pad"
            placeholder="hh:mm:ss"
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
              onUpdate(workoutSet.id, {
                durationSeconds: formattedToSeconds(durationInput),
              });
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
