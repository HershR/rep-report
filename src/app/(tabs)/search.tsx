import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { CustomCard, CustomScreen, CustomText } from "@/components/common";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import { useExerciseSearch } from "@/features/exercises/hooks/useExerciseSearch";
import { spacing, useThemeColors } from "@/theme";

export default function SearchScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const filters = useMemo(() => ({ query, page: 1, limit: 20 }), [query]);

  const { items, isLoading, isError, error, debouncedQuery, refetch } =
    useExerciseSearch(filters);
  const { saveFavoriteExercise, removeFavoriteExercise } =
    useFavoriteExercises();

  const onToggleFavorite = async (exercise: (typeof items)[number]) => {
    if (exercise.isFavorite) {
      await removeFavoriteExercise({ wgerExerciseId: exercise.wgerExerciseId });
      return;
    }
    await saveFavoriteExercise(exercise);
  };

  return (
    <CustomScreen scroll>
      <CustomText variant="title">Search</CustomText>
      <CustomText muted style={styles.subtitle}>
        Find exercises from WGER.
      </CustomText>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search exercises"
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

      {isLoading && (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {isError && (
        <CustomCard style={styles.gap}>
          <CustomText>Could not load search results right now.</CustomText>
          <CustomText muted>{error?.message ?? "Unknown error"}</CustomText>
          <Pressable onPress={refetch} style={styles.retryButton}>
            <CustomText>Retry</CustomText>
          </Pressable>
        </CustomCard>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <CustomCard style={styles.gap}>
          <CustomText>
            {debouncedQuery
              ? "No exercises found. Try another keyword."
              : "Type exercise name to start searching."}
          </CustomText>
        </CustomCard>
      )}

      <View style={styles.results}>
        <FlashList
          data={items}
          keyExtractor={(exercise) => String(exercise.wgerExerciseId)}
          contentContainerStyle={{ gap: spacing.sm }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item: exercise }) => (
            <CustomCard style={styles.card}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/exercise/[exerciseId]",
                    params: {
                      exerciseId: String(exercise.wgerExerciseId),
                      source: "wger",
                    },
                  })
                }
              >
                <CustomText>{exercise.name}</CustomText>
                {exercise.category ? (
                  <CustomText muted>{exercise.category}</CustomText>
                ) : null}
                {exercise.description ? (
                  <CustomText muted numberOfLines={2}>
                    {exercise.description}
                  </CustomText>
                ) : null}
              </Pressable>

              <Pressable
                style={styles.favoriteButton}
                onPress={() => {
                  void onToggleFavorite(exercise);
                }}
              >
                <CustomText>
                  {exercise.isFavorite ? "Unfavorite" : "Favorite"}
                </CustomText>
              </Pressable>
            </CustomCard>
          )}
        />
      </View>
    </CustomScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: spacing.xs },
  gap: { marginTop: spacing.md },
  input: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  results: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  card: {
    gap: spacing.sm,
  },
  favoriteButton: {
    marginTop: spacing.xs,
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  retryButton: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});
