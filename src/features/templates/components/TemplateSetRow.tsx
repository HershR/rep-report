import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { CustomText } from "@/components/common";
import { spacing, useThemeColors } from "@/theme";

type TemplateSetRowProps = {
  index: number;
  repsText: string;
  weightText: string;
  durationText: string;
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
  onChangeReps,
  onChangeWeight,
  onChangeDuration,
  onDelete,
}: TemplateSetRowProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <CustomText muted>{`Set ${index + 1}`}</CustomText>
        <Pressable onPress={onDelete}>
          <CustomText muted>Delete</CustomText>
        </Pressable>
      </View>

      <View style={styles.row}>
        <TextInput
          value={repsText}
          onChangeText={onChangeReps}
          keyboardType="numeric"
          placeholder="Reps"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
        />
        <TextInput
          value={weightText}
          onChangeText={onChangeWeight}
          keyboardType="numeric"
          placeholder="Weight"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
        />
        <TextInput
          value={durationText}
          onChangeText={onChangeDuration}
          keyboardType="numeric"
          placeholder="Duration(s)"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
        />
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
