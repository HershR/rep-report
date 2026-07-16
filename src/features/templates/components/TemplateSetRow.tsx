import { useEffect, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { CustomText } from "@/components/common";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import {
  durationDisplayToSeconds,
  formatDurationInput,
  secondsToDurationDisplay,
} from "@/features/workouts/utils/durationInput";
import { distanceToText, textToMetricDistance, weightToText, textToMetricWeight } from "@/lib/units";
import { spacing, useThemeColors } from "@/theme";

type TemplateSetRowProps = {
  index: number;
  repsText: string;
  weightText: string;
  durationText: string;
  distanceText: string;
  isCardio: boolean;
  onChangeReps: (value: string) => void;
  onChangeWeight: (value: string) => void;
  onChangeDuration: (value: string) => void;
  onChangeDistance: (value: string) => void;
  onDelete: () => void;
};

export function TemplateSetRow({
  index,
  repsText,
  weightText,
  durationText,
  distanceText,
  isCardio,
  onChangeReps,
  onChangeWeight,
  onChangeDuration,
  onChangeDistance,
  onDelete,
}: TemplateSetRowProps) {
  const colors = useThemeColors();
  const { appSettings } = useAppSettings();
  const distanceUnit = appSettings?.distanceUnit ?? "mi";
  const weightUnit = appSettings?.weightUnit ?? "lb";

  const [durationInput, setDurationInput] = useState("");
  const [isDurationFocused, setIsDurationFocused] = useState(false);
  const [distanceInput, setDistanceInput] = useState("");
  const [isDistanceFocused, setIsDistanceFocused] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [isWeightFocused, setIsWeightFocused] = useState(false);

  useEffect(() => {
    if (isDurationFocused) return;
    const secondsValue = Number(durationText || "0");
    setDurationInput(secondsToDurationDisplay(Number.isFinite(secondsValue) ? secondsValue : 0));
  }, [durationText, isDurationFocused]);

  useEffect(() => {
    if (isDistanceFocused) return;
    const kmValue = Number(distanceText || "0");
    setDistanceInput(distanceToText(Number.isFinite(kmValue) && kmValue > 0 ? kmValue : null, distanceUnit));
  }, [distanceText, distanceUnit, isDistanceFocused]);

  useEffect(() => {
    if (isWeightFocused) return;
    const kgValue = Number(weightText || "0");
    setWeightInput(weightToText(Number.isFinite(kgValue) && kgValue > 0 ? kgValue : null, weightUnit));
  }, [weightText, weightUnit, isWeightFocused]);

  const commitDuration = () => {
    setIsDurationFocused(false);
    onChangeDuration(String(durationDisplayToSeconds(durationInput)));
  };

  const onChangeDurationInput = (value: string) => {
    const formatted = formatDurationInput(value);
    setDurationInput(formatted);
    onChangeDuration(String(durationDisplayToSeconds(formatted)));
  };

  const commitDistance = () => {
    setIsDistanceFocused(false);
    const metricValue = textToMetricDistance(distanceInput, distanceUnit);
    onChangeDistance(metricValue === null ? "" : String(metricValue));
  };

  const onChangeDistanceInput = (value: string) => {
    setDistanceInput(value);
    const metricValue = textToMetricDistance(value, distanceUnit);
    onChangeDistance(metricValue === null ? "" : String(metricValue));
  };

  const commitWeight = () => {
    setIsWeightFocused(false);
    const metricValue = textToMetricWeight(weightInput, weightUnit);
    onChangeWeight(metricValue === null ? "" : String(metricValue));
  };

  const onChangeWeightInput = (value: string) => {
    setWeightInput(value);
    const metricValue = textToMetricWeight(value, weightUnit);
    onChangeWeight(metricValue === null ? "" : String(metricValue));
  };

  return (
    <View
      style={[
        styles.container,
        { borderColor: colors.border, backgroundColor: colors.background },
      ]}
    >
      <View style={styles.header}>
        <CustomText muted>{`Set ${index + 1}`}</CustomText>
        <Pressable onPress={onDelete}>
          <CustomText muted>Delete</CustomText>
        </Pressable>
      </View>

      <View style={styles.row}>
        {isCardio ? (
          <>
            <TextInput
              value={durationInput}
              onChangeText={onChangeDurationInput}
              keyboardType="numeric"
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
              onChangeText={onChangeDistanceInput}
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
              value={repsText}
              onChangeText={onChangeReps}
              keyboardType="numeric"
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
            />
            <TextInput
              value={weightInput}
              onChangeText={onChangeWeightInput}
              keyboardType="decimal-pad"
              placeholder={`Weight (${weightUnit})`}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
