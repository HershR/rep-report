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

function secondsToFormatted(value: string): string {
  const totalSeconds = Number(value || "0");
  const safe = Number.isFinite(totalSeconds)
    ? Math.max(0, Math.floor(totalSeconds))
    : 0;
  if (safe === 0) return "";
  const hh = Math.floor(safe / 3600);
  const mm = Math.floor((safe % 3600) / 60);
  const ss = safe % 60;
  if (hh > 0) return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  if (mm > 0) return `${mm}:${String(ss).padStart(2, "0")}`;
  return String(ss);
}

function formattedToSeconds(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 6).padStart(6, "0");
  const hh = Number(digits.slice(0, 2));
  const mm = Number(digits.slice(2, 4));
  const ss = Number(digits.slice(4, 6));
  return String(hh * 3600 + mm * 60 + ss);
}

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
  const [durationInput, setDurationInput] = useState("");

  useEffect(() => {
    setDurationInput(secondsToFormatted(durationText));
  }, [durationText]);

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
              onChangeText={(value) => setDurationInput(formatDurationInput(value))}
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
              onEndEditing={() => onChangeDuration(formattedToSeconds(durationInput))}
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
