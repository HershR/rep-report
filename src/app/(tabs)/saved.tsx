import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from "react-native";

import { CustomCard, CustomScreen, CustomText } from "@/components/common";
import { ExerciseCard } from "@/features/exercises/components/ExerciseCard";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import type { Exercise } from "@/features/exercises/types";
import { spacing, useThemeColors } from "@/theme";
import { FlashList } from "@shopify/flash-list";

export default function SavedScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { favorites, isLoading, error, removeFavoriteExercise } =
    useFavoriteExercises();
  const [exerciseToRemove, setExerciseToRemove] = useState<Exercise | null>(null);

  const closeRemoveModal = () => setExerciseToRemove(null);

  const confirmRemoveFavorite = async () => {
    if (!exerciseToRemove) return;
    await removeFavoriteExercise({ id: exerciseToRemove.id });
    closeRemoveModal();
  };

  return (
    <CustomScreen scroll>
      <CustomText variant="title">Saved</CustomText>
      <CustomText muted style={styles.subtitle}>
        Favorite exercises saved offline.
      </CustomText>

      {isLoading && (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {!isLoading && error && (
        <CustomCard style={styles.gap}>
          <CustomText>Could not load saved exercises.</CustomText>
        </CustomCard>
      )}

      {!isLoading && !error && favorites.length === 0 && (
        <CustomCard style={styles.gap}>
          <CustomText>
            No saved exercises yet. Search and tap Favorite.
          </CustomText>
        </CustomCard>
      )}

      <View style={styles.gap}>
        <FlashList
          data={favorites}
          keyExtractor={(exercise) => String(exercise.id)}
          contentContainerStyle={{ gap: spacing.sm }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item: exercise }) => (
            <ExerciseCard
              name={exercise.name}
              category={exercise.category}
              imageUrl={exercise.imageUrl}
              isFavorite
              onPress={() =>
                router.push({
                  pathname: "/exercise/[exerciseId]",
                  params: {
                    exerciseId: exercise.id,
                    source: "local",
                  },
                })
              }
              onToggleFavorite={() => {
                setExerciseToRemove(exercise);
              }}
            />
          )}
        />
      </View>

      <Modal
        transparent
        visible={Boolean(exerciseToRemove)}
        animationType="fade"
        onRequestClose={closeRemoveModal}
      >
        <View style={styles.modalOverlay}>
          <CustomCard
            style={[
              styles.modalCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <CustomText>Remove from favorites?</CustomText>
            <CustomText muted style={styles.modalCopy}>
              {exerciseToRemove
                ? `${exerciseToRemove.name} will be removed from favorites.`
                : "This exercise will be removed from favorites."}
            </CustomText>

            <View style={styles.modalActions}>
              <Pressable onPress={closeRemoveModal} style={styles.modalButton}>
                <CustomText muted>Cancel</CustomText>
              </Pressable>
              <Pressable onPress={() => void confirmRemoveFavorite()} style={styles.modalButton}>
                <CustomText>Remove</CustomText>
              </Pressable>
            </View>
          </CustomCard>
        </View>
      </Modal>
    </CustomScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: spacing.xs },
  gap: { marginTop: spacing.lg },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  modalCard: {
    gap: spacing.sm,
  },
  modalCopy: {
    marginTop: spacing.xs,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modalButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});
