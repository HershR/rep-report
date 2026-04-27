import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { CustomCard, CustomScreen, CustomText } from "@/components/common";
import { ExerciseCard } from "@/features/exercises/components/ExerciseCard";
import { ExerciseFilterModal } from "@/features/exercises/components/ExerciseFilterModal";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import { useExerciseSearch } from "@/features/exercises/hooks/useExerciseSearch";
import type { ExerciseFilterOption } from "@/features/exercises/types";
import {
  wgerCategories,
  wgerEquipment,
  wgerMuscles,
} from "@/services/wger/constants";
import { spacing, useThemeColors } from "@/theme";

export default function SearchScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pendingPage, setPendingPage] = useState<number | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<number[]>([]);
  const [selectedMuscleIds, setSelectedMuscleIds] = useState<number[]>([]);

  const categoryOptions = useMemo<ExerciseFilterOption[]>(
    () =>
      Object.entries(wgerCategories).map(([id, name]) => ({
        id: Number(id),
        name,
      })),
    [],
  );

  const equipmentOptions = useMemo<ExerciseFilterOption[]>(
    () =>
      Object.entries(wgerEquipment).map(([id, name]) => ({
        id: Number(id),
        name,
      })),
    [],
  );

  const muscleOptions = useMemo<ExerciseFilterOption[]>(
    () =>
      wgerMuscles.map((item) => ({
        id: item.id,
        name: item.name_en || item.name,
      })),
    [],
  );

  const filters = useMemo(
    () => ({
      query,
      page,
      limit: 20,
      categoryIds: selectedCategoryIds,
      equipmentIds: selectedEquipmentIds,
      muscleIds: selectedMuscleIds,
    }),
    [query, page, selectedCategoryIds, selectedEquipmentIds, selectedMuscleIds],
  );

  const {
    items,
    total,
    nextPage,
    previousPage,
    isLoading,
    isFetching,
    isError,
    error,
    debouncedQuery,
    refetch,
  } = useExerciseSearch(filters);
  const { saveFavoriteExercise, removeFavoriteExercise } =
    useFavoriteExercises();

  const onToggleFavorite = async (exercise: (typeof items)[number]) => {
    if (exercise.isFavorite) {
      await removeFavoriteExercise({ wgerExerciseId: exercise.wgerExerciseId });
      return;
    }
    await saveFavoriteExercise(exercise);
  };

  const clearFilters = () => {
    setSelectedCategoryIds([]);
    setSelectedEquipmentIds([]);
    setSelectedMuscleIds([]);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / 20));

  useEffect(() => {
    if (!isFetching) {
      setPendingPage(null);
    }
  }, [isFetching]);

  const onChangeQuery = (value: string) => {
    setQuery(value);
    setPage(1);
    setPendingPage(null);
  };

  const activeFilterCount =
    selectedCategoryIds.length +
    selectedEquipmentIds.length +
    selectedMuscleIds.length;

  return (
    <CustomScreen scroll>
      <CustomText variant="title">Search</CustomText>
      <CustomText muted style={styles.subtitle}>
        Find exercises from WGER.
      </CustomText>

      <TextInput
        value={query}
        onChangeText={onChangeQuery}
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
        <Pressable
          onPress={() => setFilterModalVisible(true)}
          style={[
            styles.openFilterButton,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <CustomText>{`Filters (${activeFilterCount})`}</CustomText>
        </Pressable>

        {activeFilterCount > 0 ? (
          <Pressable onPress={clearFilters}>
            <CustomText muted>Clear</CustomText>
          </Pressable>
        ) : null}
      </View>

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
        {!isLoading && !isError && items.length > 0 ? (
          <View style={styles.paginationHeader}>
            <CustomText muted>{`Showing ${items.length} of ${total}`}</CustomText>
            <CustomText muted>{`Page ${page} of ${totalPages}`}</CustomText>
          </View>
        ) : null}
        <FlashList
          data={items}
          keyExtractor={(exercise) => String(exercise.wgerExerciseId)}
          contentContainerStyle={{ gap: spacing.sm }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item: exercise }) => (
            <ExerciseCard
              name={exercise.name}
              category={exercise.category}
              imageUrl={exercise.imageUrl}
              isFavorite={exercise.isFavorite}
              onPress={() =>
                router.push({
                  pathname: "/exercise/[exerciseId]",
                  params: {
                    exerciseId: String(exercise.wgerExerciseId),
                    source: "wger",
                  },
                })
              }
              onToggleFavorite={() => {
                void onToggleFavorite(exercise);
              }}
            />
          )}
          ListFooterComponent={
            pendingPage !== null && isFetching && !isLoading ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <CustomText muted>Loading page...</CustomText>
              </View>
            ) : !isLoading && !isError && items.length > 0 ? (
              <View style={styles.numberedPagination}>
                <Pressable
                  onPress={() => {
                    if (!previousPage) return;
                    setPendingPage(previousPage);
                    setPage(previousPage);
                  }}
                  disabled={!previousPage}
                  style={[
                    styles.pageButton,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                      opacity: previousPage ? 1 : 0.5,
                    },
                  ]}
                >
                  <CustomText>Previous</CustomText>
                </Pressable>

                <Pressable
                  onPress={() => {
                    if (!nextPage) return;
                    setPendingPage(nextPage);
                    setPage(nextPage);
                  }}
                  disabled={!nextPage}
                  style={[
                    styles.pageButton,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                      opacity: nextPage ? 1 : 0.5,
                    },
                  ]}
                >
                  <CustomText>Next</CustomText>
                </Pressable>
              </View>
            ) : null
          }
        />
      </View>
      <ExerciseFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        categoryOptions={categoryOptions}
        equipmentOptions={equipmentOptions}
        muscleOptions={muscleOptions}
        selectedCategoryIds={selectedCategoryIds}
        selectedEquipmentIds={selectedEquipmentIds}
        selectedMuscleIds={selectedMuscleIds}
        onToggleCategory={(id) =>
          setSelectedCategoryIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
          )
        }
        onToggleEquipment={(id) =>
          setSelectedEquipmentIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
          )
        }
        onToggleMuscle={(id) =>
          setSelectedMuscleIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
          )
        }
        onClearAll={clearFilters}
      />
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
  openFilterButton: {
    borderWidth: 1,
    borderRadius: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  results: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  paginationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLoading: {
    marginTop: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  numberedPagination: {
    marginTop: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  pageButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: spacing.sm,
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  retryButton: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});
