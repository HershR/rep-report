import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { CustomCard, CustomScreen, CustomText } from "@/components/common";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import { spacing } from "@/theme";

export default function SavedScreen() {
  const router = useRouter();
  const { favorites, isLoading, error, removeFavoriteExercise } = useFavoriteExercises();

  return (
    <CustomScreen scroll>
      <CustomText variant="title">Saved</CustomText>
      <CustomText muted style={styles.subtitle}>
        Favorite exercises saved offline.
      </CustomText>

      {isLoading ? <CustomText style={styles.gap}>Loading saved exercises...</CustomText> : null}

      {error ? (
        <CustomCard style={styles.gap}>
          <CustomText>Could not load saved exercises.</CustomText>
        </CustomCard>
      ) : null}

      {!isLoading && !error && favorites.length === 0 ? (
        <CustomCard style={styles.gap}>
          <CustomText>No saved exercises yet. Search and tap Favorite.</CustomText>
        </CustomCard>
      ) : null}

      <View style={styles.gap}>
        {favorites.map((exercise) => (
          <CustomCard key={exercise.id} style={styles.card}>
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
              {exercise.category ? <CustomText muted>{exercise.category}</CustomText> : null}
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
        ))}
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
