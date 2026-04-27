import { useEffect, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { CustomText } from "@/components/common";
import { spacing, useThemeColors } from "@/theme";

type TemplateSetRowProps = {
  index: number;
  repsText: string;
  weightText: string;
  durationText: string;
  isCardio: boolean;
  onChangeReps: (value: string) => void;
  onChangeWeight: (value: string) => void;
  onChangeDuration: (value: string) => void;
  onDelete: () => void;
};

export function TemplateSetRow({
  index,
  repsText,
  weightText,
  durationText,
  isCardio,
  onChangeReps,
  onChangeWeight,
  onChangeDuration,
  onDelete,
}: TemplateSetRowProps) {
  const colors = useThemeColors();
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("0");
  const [seconds, setSeconds] = useState("0");

  useEffect(() => {
    const totalSeconds = Number(durationText || "0");
    const safe = Number.isFinite(totalSeconds)
      ? Math.max(0, Math.floor(totalSeconds))
      : 0;
    setHours(String(Math.floor(safe / 3600)));
    setMinutes(String(Math.floor((safe % 3600) / 60)));
    setSeconds(String(safe % 60));
  }, [durationText]);

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
    )
      return;
    const total = Math.max(
      0,
      Math.floor(parsedHours) * 3600 +
        Math.floor(parsedMinutes) * 60 +
        Math.floor(parsedSeconds),
    );
    onChangeDuration(String(total));
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
              value={hours}
              onChangeText={setHours}
              keyboardType="numeric"
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
              onEndEditing={() => commitDuration(hours, minutes, seconds)}
            />
            <TextInput
              value={minutes}
              onChangeText={setMinutes}
              keyboardType="numeric"
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
              onEndEditing={() => commitDuration(hours, minutes, seconds)}
            />
            <TextInput
              value={seconds}
              onChangeText={setSeconds}
              keyboardType="numeric"
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
              onEndEditing={() => commitDuration(hours, minutes, seconds)}
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
