import { Modal, Pressable, StyleSheet, View } from "react-native";
import { FlashList } from "@shopify/flash-list";

import { CustomCard, CustomText } from "@/components/common";
import type { Exercise } from "@/features/exercises/types";
import { spacing, useThemeColors } from "@/theme";

type AddSavedExerciseSheetProps = {
  visible: boolean;
  favorites: Exercise[];
  selectedExerciseIds: string[];
  onClose: () => void;
  onAddExercise: (exercise: Exercise) => void;
};

export function AddSavedExerciseSheet({
  visible,
  favorites,
  selectedExerciseIds,
  onClose,
  onAddExercise,
}: AddSavedExerciseSheetProps) {
  const colors = useThemeColors();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <CustomCard style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.header}>
            <CustomText>Add Saved Exercise</CustomText>
            <Pressable onPress={onClose}>
              <CustomText muted>Close</CustomText>
            </Pressable>
          </View>

          {favorites.length === 0 ? (
            <CustomText muted>No saved exercises available.</CustomText>
          ) : (
            <FlashList
              data={favorites}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const alreadySelected = selectedExerciseIds.includes(item.id);
                return (
                  <Pressable
                    disabled={alreadySelected}
                    onPress={() => onAddExercise(item)}
                    style={({ pressed }) => [
                      styles.row,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        opacity: alreadySelected ? 0.5 : pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <CustomText>{item.name}</CustomText>
                    <CustomText muted>{alreadySelected ? "Added" : "Add"}</CustomText>
                  </Pressable>
                );
              }}
            />
          )}
        </CustomCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  sheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: "70%",
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row: {
    borderWidth: 1,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
