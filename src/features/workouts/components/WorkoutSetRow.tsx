import { useEffect, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { CustomText } from "@/components/common";
import type { WorkoutSessionSet } from "@/features/workouts/types";
import {
  durationDisplayToSeconds,
  formatDurationInput,
  secondsToDurationDisplay,
} from "@/features/workouts/utils/durationInput";
import { spacing, useThemeColors } from "@/theme";

type WorkoutSetRowProps = {
  index: number;
  workoutSet: WorkoutSessionSet;
  isCardio: boolean;
  commitOnChange?: boolean;
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
  commitOnChange = false,
  onUpdate,
  onDelete,
}: WorkoutSetRowProps) {
  const colors = useThemeColors();
  const isCompleted = workoutSet.isCompleted === 1;
  const [durationInput, setDurationInput] = useState("");

  useEffect(() => {
    setDurationInput(secondsToDurationDisplay(workoutSet.durationSeconds));
  }, [workoutSet.durationSeconds, workoutSet.id]);

  const commitDuration = () => {
    onUpdate(workoutSet.id, {
      durationSeconds: durationDisplayToSeconds(durationInput),
    });
  };

  return (
    <View style={styles.row}>
      <CustomText muted style={styles.index}>{`#${index + 1}`}</CustomText>
      {isCardio ? (
        <>
          <TextInput
            value={durationInput}
            onChangeText={(value) => {
              const formatted = formatDurationInput(value);
              setDurationInput(formatted);
              if (commitOnChange) {
                onUpdate(workoutSet.id, {
                  durationSeconds: durationDisplayToSeconds(formatted),
                });
              }
            }}
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
            onEndEditing={commitDuration}
            onBlur={commitDuration}
            onSubmitEditing={commitDuration}
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
              if (!commitOnChange) {
                onUpdate(workoutSet.id, {
                  reps: toNumber(event.nativeEvent.text),
                });
              }
            }}
            onChangeText={
              commitOnChange
                ? (value) => {
                    onUpdate(workoutSet.id, {
                      reps: toNumber(value),
                    });
                  }
                : undefined
            }
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
              if (!commitOnChange) {
                onUpdate(workoutSet.id, {
                  weight: toNumber(event.nativeEvent.text),
                });
              }
            }}
            onChangeText={
              commitOnChange
                ? (value) => {
                    onUpdate(workoutSet.id, {
                      weight: toNumber(value),
                    });
                  }
                : undefined
            }
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
