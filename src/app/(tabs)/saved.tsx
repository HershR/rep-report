import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from "react-native";

import { CustomCard, CustomScreen, CustomText } from "@/components/common";
import { ExerciseCard } from "@/features/exercises/components/ExerciseCard";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import type { Exercise } from "@/features/exercises/types";
import { TemplateCard } from "@/features/templates/components/TemplateCard";
import { useWorkoutTemplates } from "@/features/templates/hooks/useWorkoutTemplates";
import type { WorkoutTemplate } from "@/features/templates/types";
import { spacing, useThemeColors } from "@/theme";
import { FlashList } from "@shopify/flash-list";

export default function SavedScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { favorites, isLoading, error, removeFavoriteExercise } =
    useFavoriteExercises();
  const {
    templates,
    isLoading: templatesLoading,
    error: templatesError,
    deleteWorkoutTemplate,
  } = useWorkoutTemplates();
  const [exerciseToRemove, setExerciseToRemove] = useState<Exercise | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<WorkoutTemplate | null>(null);

  const closeRemoveModal = () => setExerciseToRemove(null);

  const confirmRemoveFavorite = async () => {
    if (!exerciseToRemove) return;
    await removeFavoriteExercise({ id: exerciseToRemove.id });
    closeRemoveModal();
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;
    await deleteWorkoutTemplate(templateToDelete.id);
    setTemplateToDelete(null);
  };

  return (
    <CustomScreen scroll>
      <CustomText variant="title">Saved</CustomText>
      <CustomText muted style={styles.subtitle}>Manage saved exercises and templates.</CustomText>

      <View style={styles.sectionHeader}>
        <CustomText>Saved Exercises</CustomText>
      </View>

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

      <View style={styles.sectionHeader}>
        <CustomText>Workout Templates</CustomText>
        <Pressable onPress={() => router.push("/workout/template/new" as Href)}>
          <CustomText muted>Create New</CustomText>
        </Pressable>
      </View>

      {templatesLoading ? (
        <View style={{ alignItems: "center", marginTop: spacing.md }}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : null}

      {!templatesLoading && templatesError ? (
        <CustomCard style={styles.gap}>
          <CustomText>Could not load templates.</CustomText>
        </CustomCard>
      ) : null}

      {!templatesLoading && !templatesError && templates.length === 0 ? (
        <CustomCard style={styles.gap}>
          <CustomText>No workout templates yet. Create one to start faster.</CustomText>
        </CustomCard>
      ) : null}

      <View style={styles.gap}>
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onPress={() => {
              router.push({
                pathname: "/workout/template/[templateId]",
                params: { templateId: template.id },
              } as unknown as Href);
            }}
            onDelete={() => setTemplateToDelete(template)}
          />
        ))}
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

      <Modal
        transparent
        visible={Boolean(templateToDelete)}
        animationType="fade"
        onRequestClose={() => setTemplateToDelete(null)}
      >
        <View style={styles.modalOverlay}>
          <CustomCard
            style={[
              styles.modalCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <CustomText>Delete template?</CustomText>
            <CustomText muted style={styles.modalCopy}>
              {templateToDelete
                ? `${templateToDelete.name} will be permanently removed.`
                : "This template will be permanently removed."}
            </CustomText>
            <View style={styles.modalActions}>
              <Pressable onPress={() => setTemplateToDelete(null)} style={styles.modalButton}>
                <CustomText muted>Cancel</CustomText>
              </Pressable>
              <Pressable onPress={() => void confirmDeleteTemplate()} style={styles.modalButton}>
                <CustomText>Delete</CustomText>
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
  sectionHeader: {
    marginTop: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
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
