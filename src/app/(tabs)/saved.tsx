import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { CustomCard, CustomScreen, CustomText } from "@/components/common";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import { spacing, useThemeColors } from "@/theme";
import { FlashList } from "@shopify/flash-list";

export default function SavedScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { favorites, isLoading, error, removeFavoriteExercise } =
    useFavoriteExercises();

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
            <CustomCard style={styles.card}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/exercise/[exerciseId]",
                    params: {
                      exerciseId: exercise.id,
                      source: "local",
                    },
                  })
                }
              >
                <CustomText>{exercise.name}</CustomText>
                {exercise.category ? (
                  <CustomText muted>{exercise.category}</CustomText>
                ) : null}
              </Pressable>

              <Pressable
                onPress={() => {
                  void removeFavoriteExercise({ id: exercise.id });
                }}
                style={styles.removeButton}
              >
                <CustomText>Remove</CustomText>
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
  gap: { marginTop: spacing.lg },
  card: { gap: spacing.sm },
  removeButton: {
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});
