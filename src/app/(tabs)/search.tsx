import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
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
import type { ExerciseFilterOption } from "@/features/exercises/types";
import {
  getWgerEquipment,
  getWgerExerciseCategories,
  getWgerMuscles,
} from "@/services/wger/client";
import { spacing, useThemeColors } from "@/theme";

export default function SearchScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<number[]>([]);
  const [selectedMuscleIds, setSelectedMuscleIds] = useState<number[]>([]);

  const filters = useMemo(
    () => ({
      query,
      page: 1,
      limit: 20,
      categoryIds: selectedCategoryIds,
      equipmentIds: selectedEquipmentIds,
      muscleIds: selectedMuscleIds,
    }),
    [query, selectedCategoryIds, selectedEquipmentIds, selectedMuscleIds],
  );

  const { items, isLoading, isError, error, debouncedQuery, refetch } =
    useExerciseSearch(filters);
  const { saveFavoriteExercise, removeFavoriteExercise } =
    useFavoriteExercises();

  const categoriesQuery = useQuery({
    queryKey: ["wger-filter-categories"],
    queryFn: getWgerExerciseCategories,
    staleTime: 5 * 60_000,
  });

  const equipmentQuery = useQuery({
    queryKey: ["wger-filter-equipment"],
    queryFn: getWgerEquipment,
    staleTime: 5 * 60_000,
  });

  const musclesQuery = useQuery({
    queryKey: ["wger-filter-muscles"],
    queryFn: getWgerMuscles,
    staleTime: 5 * 60_000,
  });

  const onToggleFavorite = async (exercise: (typeof items)[number]) => {
    if (exercise.isFavorite) {
      await removeFavoriteExercise({ wgerExerciseId: exercise.wgerExerciseId });
      return;
    }
    await saveFavoriteExercise(exercise);
  };

  const toggleId = (
    id: number,
    values: number[],
    setValues: Dispatch<SetStateAction<number[]>>,
  ) => {
    setValues((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const clearFilters = () => {
    setSelectedCategoryIds([]);
    setSelectedEquipmentIds([]);
    setSelectedMuscleIds([]);
  };

  const filterLoadError =
    categoriesQuery.isError || equipmentQuery.isError || musclesQuery.isError;

  const filterLoading =
    categoriesQuery.isLoading || equipmentQuery.isLoading || musclesQuery.isLoading;

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

      <View style={styles.filtersHeader}>
        <CustomText>Filters</CustomText>
        <Pressable onPress={clearFilters}>
          <CustomText muted>Clear</CustomText>
        </Pressable>
      </View>

      {filterLoading ? <CustomText muted>Loading filters...</CustomText> : null}
      {filterLoadError ? (
        <CustomText muted style={styles.filterError}>
          Some filters unavailable right now. Search still works.
        </CustomText>
      ) : null}

      {renderFilterSection({
        title: "Categories",
        options: categoriesQuery.data ?? [],
        selectedIds: selectedCategoryIds,
        onToggle: (id) => toggleId(id, selectedCategoryIds, setSelectedCategoryIds),
      })}

      {renderFilterSection({
        title: "Equipment",
        options: equipmentQuery.data ?? [],
        selectedIds: selectedEquipmentIds,
        onToggle: (id) => toggleId(id, selectedEquipmentIds, setSelectedEquipmentIds),
      })}

      {renderFilterSection({
        title: "Muscles",
        options: musclesQuery.data ?? [],
        selectedIds: selectedMuscleIds,
        onToggle: (id) => toggleId(id, selectedMuscleIds, setSelectedMuscleIds),
      })}

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
  filtersHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  filterError: {
    marginTop: spacing.xs,
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

function renderFilterSection({
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
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <CustomText>{selected ? `\u2713 ${option.name}` : option.name}</CustomText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
