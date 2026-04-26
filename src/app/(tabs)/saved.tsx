import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { CustomCard, CustomScreen, CustomText } from "@/components/common";
import { ExerciseCard } from "@/features/exercises/components/ExerciseCard";
import type { Exercise } from "@/features/exercises/types";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import { spacing, useThemeColors } from "@/theme";
import { FlashList } from "@shopify/flash-list";

type SavedExerciseRow = Exercise & {
  uiIsFavorite: boolean;
};

export default function SavedScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { favorites, isLoading, error, removeFavoriteExercise, saveFavoriteExercise } =
    useFavoriteExercises();
  const [savedRows, setSavedRows] = useState<SavedExerciseRow[]>([]);

  useEffect(() => {
    setSavedRows((prev) => {
      const mergedFavorites = favorites.map((exercise) => ({
        ...exercise,
        uiIsFavorite: true,
      }));

      const mergedIds = new Set(mergedFavorites.map((row) => row.id));
      const staleRows = prev
        .filter((row) => !mergedIds.has(row.id))
        .map((row) => ({ ...row, uiIsFavorite: false }));

      return [...mergedFavorites, ...staleRows];
    });
  }, [favorites]);

  const toggleRowFavorite = async (exercise: SavedExerciseRow) => {
    if (exercise.uiIsFavorite) {
      await removeFavoriteExercise({ id: exercise.id });
      setSavedRows((prev) =>
        prev.map((row) =>
          row.id === exercise.id ? { ...row, uiIsFavorite: false } : row,
        ),
      );
      return;
    }

    if (exercise.wgerExerciseId === null) {
      return;
    }

    await saveFavoriteExercise({
      id: String(exercise.wgerExerciseId),
      wgerExerciseId: exercise.wgerExerciseId,
      name: exercise.name,
      description: exercise.description,
      category: exercise.category,
      equipment: exercise.equipment,
      primaryMuscles: exercise.primaryMuscles,
      secondaryMuscles: exercise.secondaryMuscles,
      imageUrl: exercise.imageUrl,
      source: "wger",
      isFavorite: true,
    });

    setSavedRows((prev) =>
      prev.map((row) =>
        row.id === exercise.id ? { ...row, uiIsFavorite: true } : row,
      ),
    );
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

      {!isLoading && !error && savedRows.length === 0 && (
        <CustomCard style={styles.gap}>
          <CustomText>
            No saved exercises yet. Search and tap Favorite.
          </CustomText>
        </CustomCard>
      )}

      <View style={styles.gap}>
        <FlashList
          data={savedRows}
          keyExtractor={(exercise) => String(exercise.id)}
          contentContainerStyle={{ gap: spacing.sm }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item: exercise }) => (
            <ExerciseCard
              name={exercise.name}
              category={exercise.category}
              imageUrl={exercise.imageUrl}
              isFavorite={exercise.uiIsFavorite}
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
                void toggleRowFavorite(exercise);
              }}
            />
          )}
        />
      </View>
    </CustomScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: spacing.xs },
  gap: { marginTop: spacing.lg },
});
