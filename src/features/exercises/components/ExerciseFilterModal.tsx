import { Modal, Pressable, StyleSheet, View } from "react-native";

import { CustomText } from "@/components/common";
import type { ExerciseFilterOption } from "@/features/exercises/types";
import { spacing, useThemeColors } from "@/theme";

type ExerciseFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  categoryOptions: ExerciseFilterOption[];
  equipmentOptions: ExerciseFilterOption[];
  muscleOptions: ExerciseFilterOption[];
  selectedCategoryIds: number[];
  selectedEquipmentIds: number[];
  selectedMuscleIds: number[];
  onToggleCategory: (id: number) => void;
  onToggleEquipment: (id: number) => void;
  onToggleMuscle: (id: number) => void;
  onClearAll: () => void;
};

export function ExerciseFilterModal({
  visible,
  onClose,
  categoryOptions,
  equipmentOptions,
  muscleOptions,
  selectedCategoryIds,
  selectedEquipmentIds,
  selectedMuscleIds,
  onToggleCategory,
  onToggleEquipment,
  onToggleMuscle,
  onClearAll,
}: ExerciseFilterModalProps) {
  const colors = useThemeColors();
  function FilterSection({
    title,
    options,
    selectedIds,
    onToggle,
  }: {
    title: string;
    options: ExerciseFilterOption[];
    selectedIds: number[];
    onToggle: (id: number) => void;
  }) {
    if (options.length === 0) return null;

    return (
      <View style={styles.filterSection}>
        <CustomText muted>{title}</CustomText>
        <View style={styles.chipsRow}>
          {options.map((option) => {
            const selected = selectedIds.includes(option.id);
            return (
              <Pressable
                key={option.id}
                onPress={() => onToggle(option.id)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: selected ? colors.primary : colors.surface,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <CustomText
                  style={{ color: selected ? colors.primaryText : colors.text }}
                >
                  {selected ? `\u2713 ${option.name}` : option.name}
                </CustomText>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.modalHeader}>
            <CustomText>Filters</CustomText>
            <View style={styles.modalActions}>
              <Pressable onPress={onClearAll}>
                <CustomText muted>Clear</CustomText>
              </Pressable>
              <Pressable onPress={onClose}>
                <CustomText muted>Done</CustomText>
              </Pressable>
            </View>
          </View>

          <FilterSection
            title="Categories"
            options={categoryOptions}
            selectedIds={selectedCategoryIds}
            onToggle={onToggleCategory}
          />
          <FilterSection
            title="Equipment"
            options={equipmentOptions}
            selectedIds={selectedEquipmentIds}
            onToggle={onToggleEquipment}
          />
          <FilterSection
            title="Muscles"
            options={muscleOptions}
            selectedIds={selectedMuscleIds}
            onToggle={onToggleMuscle}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalContent: {
    maxHeight: "75%",
    borderTopLeftRadius: spacing.md,
    borderTopRightRadius: spacing.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  filterSection: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    borderWidth: 2,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});
