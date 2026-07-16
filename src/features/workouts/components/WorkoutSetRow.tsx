import { useEffect, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { CustomText } from "@/components/common";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import type { WorkoutSessionSet } from "@/features/workouts/types";
import {
  durationDisplayToSeconds,
  formatDurationInput,
  secondsToDurationDisplay,
} from "@/features/workouts/utils/durationInput";
import { distanceToText, textToMetricDistance, weightToText, textToMetricWeight } from "@/lib/units";
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
      distance?: number | null;
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
  const { appSettings } = useAppSettings();
  const distanceUnit = appSettings?.distanceUnit ?? "mi";
  const weightUnit = appSettings?.weightUnit ?? "lb";
  const isCompleted = workoutSet.isCompleted === 1;

  const [durationInput, setDurationInput] = useState("");
  const [isDurationFocused, setIsDurationFocused] = useState(false);
  const [distanceInput, setDistanceInput] = useState("");
  const [isDistanceFocused, setIsDistanceFocused] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [isWeightFocused, setIsWeightFocused] = useState(false);

  useEffect(() => {
    if (isDurationFocused) return;
    setDurationInput(secondsToDurationDisplay(workoutSet.durationSeconds));
  }, [workoutSet.durationSeconds, workoutSet.id, isDurationFocused]);

  useEffect(() => {
    if (isDistanceFocused) return;
    setDistanceInput(distanceToText(workoutSet.distance, distanceUnit));
  }, [workoutSet.distance, workoutSet.id, distanceUnit, isDistanceFocused]);

  useEffect(() => {
    if (isWeightFocused) return;
    setWeightInput(weightToText(workoutSet.weight, weightUnit));
  }, [workoutSet.weight, workoutSet.id, weightUnit, isWeightFocused]);

  const commitDuration = () => {
    setIsDurationFocused(false);
    onUpdate(workoutSet.id, {
      durationSeconds: durationDisplayToSeconds(durationInput),
    });
  };

  const commitDistance = () => {
    setIsDistanceFocused(false);
    onUpdate(workoutSet.id, {
      distance: textToMetricDistance(distanceInput, distanceUnit),
    });
  };

  const commitWeight = () => {
    setIsWeightFocused(false);
    onUpdate(workoutSet.id, {
      weight: textToMetricWeight(weightInput, weightUnit),
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
            onFocus={() => setIsDurationFocused(true)}
            onEndEditing={commitDuration}
            onBlur={commitDuration}
            onSubmitEditing={commitDuration}
          />
          <TextInput
            value={distanceInput}
            onChangeText={(value) => {
              setDistanceInput(value);
              if (commitOnChange) {
                onUpdate(workoutSet.id, {
                  distance: textToMetricDistance(value, distanceUnit),
                });
              }
            }}
            keyboardType="decimal-pad"
            placeholder={`Dist (${distanceUnit})`}
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.surface,
              },
            ]}
            onFocus={() => setIsDistanceFocused(true)}
            onEndEditing={commitDistance}
            onBlur={commitDistance}
            onSubmitEditing={commitDistance}
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
            value={weightInput}
            onChangeText={(value) => {
              setWeightInput(value);
              if (commitOnChange) {
                onUpdate(workoutSet.id, {
                  weight: textToMetricWeight(value, weightUnit),
                });
              }
            }}
            keyboardType="decimal-pad"
            placeholder={`Wt (${weightUnit})`}
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.surface,
              },
            ]}
            onFocus={() => setIsWeightFocused(true)}
            onEndEditing={commitWeight}
            onBlur={commitWeight}
            onSubmitEditing={commitWeight}
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
    flexWrap: "wrap",
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
