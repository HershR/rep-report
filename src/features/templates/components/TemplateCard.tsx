import { Pressable, StyleSheet, View } from "react-native";

import { CustomCard, CustomText } from "@/components/common";
import type { WorkoutTemplate } from "@/features/templates/types";
import { spacing } from "@/theme";

type TemplateCardProps = {
  template: WorkoutTemplate;
  onPress: () => void;
  onDelete: () => void;
};

export function TemplateCard({ template, onPress, onDelete }: TemplateCardProps) {
  return (
    <CustomCard style={styles.card}>
      <View style={styles.header}>
        <Pressable onPress={onPress} style={styles.grow}>
          <CustomText>{template.name}</CustomText>
        </Pressable>
        <Pressable onPress={onDelete} hitSlop={8}>
          <CustomText muted>Delete</CustomText>
        </Pressable>
      </View>
      {template.description ? <CustomText muted>{template.description}</CustomText> : null}
      <CustomText muted>{`${template.exercises.length} exercise${
        template.exercises.length === 1 ? "" : "s"
      }`}</CustomText>
    </CustomCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  grow: {
    flex: 1,
  },
});
