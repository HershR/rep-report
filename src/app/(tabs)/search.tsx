import { useRouter } from "expo-router";
import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
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
  wgerCategories,
  wgerEquipment,
  wgerMuscles,
} from "@/services/wger/constants";
import { spacing, useThemeColors } from "@/theme";

export default function SearchScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [query, setQuery] = useState("");
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

      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <CustomText>Filters</CustomText>
              <Pressable onPress={() => setFilterModalVisible(false)}>
                <CustomText muted>Done</CustomText>
              </Pressable>
            </View>

            {renderFilterSection({
              title: "Categories",
              options: categoryOptions,
              selectedIds: selectedCategoryIds,
              onToggle: (id) =>
                toggleId(id, selectedCategoryIds, setSelectedCategoryIds),
            })}

            {renderFilterSection({
              title: "Equipment",
              options: equipmentOptions,
              selectedIds: selectedEquipmentIds,
              onToggle: (id) =>
                toggleId(id, selectedEquipmentIds, setSelectedEquipmentIds),
            })}

            {renderFilterSection({
              title: "Muscles",
              options: muscleOptions,
              selectedIds: selectedMuscleIds,
              onToggle: (id) => toggleId(id, selectedMuscleIds, setSelectedMuscleIds),
            })}
          </View>
        </View>
      </Modal>
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
  openFilterButton: {
    borderWidth: 1,
    borderRadius: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalContent: {
    maxHeight: "75%",
    borderTopLeftRadius: spacing.md,
    borderTopRightRadius: spacing.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
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
