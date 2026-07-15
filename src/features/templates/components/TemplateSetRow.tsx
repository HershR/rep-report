import { useEffect, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { CustomText } from "@/components/common";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import {
  durationDisplayToSeconds,
  formatDurationInput,
  secondsToDurationDisplay,
} from "@/features/workouts/utils/durationInput";
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
  const [durationInput, setDurationInput] = useState("");

  useEffect(() => {
    const secondsValue = Number(durationText || "0");
    setDurationInput(secondsToDurationDisplay(Number.isFinite(secondsValue) ? secondsValue : 0));
  }, [durationText]);

  const commitDuration = () => {
    onChangeDuration(String(durationDisplayToSeconds(durationInput)));
  };

  const onChangeDurationInput = (value: string) => {
    const formatted = formatDurationInput(value);
    setDurationInput(formatted);
    onChangeDuration(String(durationDisplayToSeconds(formatted)));
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
              onEndEditing={commitDuration}
              onBlur={commitDuration}
              onSubmitEditing={commitDuration}
            />
            <TextInput
              value={distanceText}
              onChangeText={onChangeDistance}
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
              value={weightText}
              onChangeText={onChangeWeight}
              keyboardType="numeric"
              placeholder="Weight"
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
