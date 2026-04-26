import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { CustomCard, CustomScreen, CustomText } from "@/components/common";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import { getExerciseById } from "@/features/exercises/repositories/exerciseRepository";
import { getWgerExerciseById } from "@/services/wger/client";
import { spacing } from "@/theme";

export default function ExerciseDetailScreen() {
  const params = useLocalSearchParams<{ exerciseId: string; source?: "local" | "wger" }>();
  const source = params.source ?? "wger";
  const exerciseId = params.exerciseId;

  const { saveFavoriteExercise, removeFavoriteExercise } = useFavoriteExercises();

  const query = useQuery({
    queryKey: ["exercise-detail", source, exerciseId],
    enabled: Boolean(exerciseId),
    queryFn: async () => {
      if (!exerciseId) return null;
      if (source === "local") {
        return getExerciseById(exerciseId);
      }
      return getWgerExerciseById(Number(exerciseId));
    },
  });

  const item = query.data;

  const onToggleFavorite = async () => {
    if (!item) return;
    if (item.isFavorite && item.wgerExerciseId !== null) {
      await removeFavoriteExercise({ wgerExerciseId: item.wgerExerciseId });
      return;
    }

    if (item.wgerExerciseId !== null) {
      await saveFavoriteExercise({
        id: String(item.wgerExerciseId),
        wgerExerciseId: item.wgerExerciseId,
        name: item.name,
        description: item.description,
        category: item.category,
        equipment: item.equipment,
        primaryMuscles: item.primaryMuscles,
        secondaryMuscles: item.secondaryMuscles,
        imageUrl: item.imageUrl,
        source: "wger",
        isFavorite: true,
      });
    }
  };

  return (
    <CustomScreen scroll>
      <CustomText variant="title">Exercise Detail</CustomText>

      {query.isLoading ? <CustomText style={styles.gap}>Loading exercise...</CustomText> : null}

      {query.isError ? (
        <CustomCard style={styles.gap}>
          <CustomText>Could not load exercise details.</CustomText>
        </CustomCard>
      ) : null}

      {!query.isLoading && !query.isError && !item ? (
        <CustomCard style={styles.gap}>
          <CustomText>Exercise not found.</CustomText>
        </CustomCard>
      ) : null}

      {item ? (
        <View style={styles.gap}>
          <CustomCard style={styles.card}>
            <CustomText>{item.name}</CustomText>
            {item.category ? <CustomText muted>Category: {item.category}</CustomText> : null}
            {item.description ? <CustomText muted>{item.description}</CustomText> : null}
            {item.equipment.length > 0 ? (
              <CustomText muted>Equipment: {item.equipment.join(", ")}</CustomText>
            ) : null}
            {item.primaryMuscles.length > 0 ? (
              <CustomText muted>Primary muscles: {item.primaryMuscles.join(", ")}</CustomText>
            ) : null}
            {item.secondaryMuscles.length > 0 ? (
              <CustomText muted>Secondary muscles: {item.secondaryMuscles.join(", ")}</CustomText>
            ) : null}

            {item.wgerExerciseId !== null ? (
              <Pressable onPress={() => void onToggleFavorite()} style={styles.favoriteButton}>
                <CustomText>{item.isFavorite ? "Unfavorite" : "Favorite"}</CustomText>
              </Pressable>
            ) : null}
          </CustomCard>
        </View>
      ) : null}
    </CustomScreen>
  );
}

const styles = StyleSheet.create({
  gap: { marginTop: spacing.lg },
  card: { gap: spacing.sm },
  favoriteButton: {
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});
