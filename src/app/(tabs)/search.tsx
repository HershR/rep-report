import { useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { FlashList } from "@shopify/flash-list";

import { CustomScreen, EmptyState, ErrorState, LoadingState } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { ExerciseRow } from "@/features/exercises/components/ExerciseRow";
import { ExerciseFilterModal } from "@/features/exercises/components/ExerciseFilterModal";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import { useExerciseSearch } from "@/features/exercises/hooks/useExerciseSearch";
import type { ExerciseFilterOption } from "@/features/exercises/types";
import {
  wgerCategories,
  wgerEquipment,
  wgerMuscles,
} from "@/services/wger/constants";

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pendingPage, setPendingPage] = useState<number | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<number[]>(
    [],
  );
  const [selectedMuscleIds, setSelectedMuscleIds] = useState<number[]>([]);

  const categoryOptions = useMemo<ExerciseFilterOption[]>(
    () =>
      Object.entries(wgerCategories)
        .map(([id, name]) => ({
          id: Number(id),
          name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const equipmentOptions = useMemo<ExerciseFilterOption[]>(
    () =>
      Object.entries(wgerEquipment)
        .map(([id, name]) => ({
          id: Number(id),
          name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const muscleOptions = useMemo<ExerciseFilterOption[]>(
    () =>
      wgerMuscles
        .map((item) => ({
          id: item.id,
          name: item.name_en || item.name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
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
    isUnavailable,
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

  const activeFilterChips = [
    ...selectedCategoryIds.map((id) => ({
      key: `category-${id}`,
      label:
        categoryOptions.find((option) => option.id === id)?.name ?? "Category",
      onRemove: () =>
        setSelectedCategoryIds((prev) => prev.filter((item) => item !== id)),
    })),
    ...selectedEquipmentIds.map((id) => ({
      key: `equipment-${id}`,
      label:
        equipmentOptions.find((option) => option.id === id)?.name ??
        "Equipment",
      onRemove: () =>
        setSelectedEquipmentIds((prev) => prev.filter((item) => item !== id)),
    })),
    ...selectedMuscleIds.map((id) => ({
      key: `muscle-${id}`,
      label: muscleOptions.find((option) => option.id === id)?.name ?? "Muscle",
      onRemove: () =>
        setSelectedMuscleIds((prev) => prev.filter((item) => item !== id)),
    })),
  ];

  return (
    <CustomScreen scroll>
      <View className="h-9 flex-row items-center justify-between">
        <Text variant="screenTitle">Exercises</Text>
        <Text variant="microLabel">WGER</Text>
      </View>

      <View className="border-input bg-surface-raised mt-3.5 h-12 flex-row items-center gap-2.5 rounded-md border px-3.5">
        <Icon as={Search} className="text-text-4 size-[18px]" />
        <Input
          className="h-12 flex-1 border-0 bg-transparent px-0"
          value={query}
          onChangeText={onChangeQuery}
          placeholder="Search exercises"
        />
        {query ? (
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 size-11"
            accessibilityLabel="Clear search"
            onPress={() => onChangeQuery("")}
          >
            <View className="bg-border-strong size-5 items-center justify-center rounded-full">
              <Icon as={X} className="text-text-2 size-3" />
            </View>
          </Button>
        ) : null}
      </View>

      <View className="mt-3.5 flex-row flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="bg-surface-inset size-11 rounded-full"
          accessibilityLabel="Filters"
          onPress={() => setFilterModalVisible(true)}
        >
          <Icon as={SlidersHorizontal} className="text-text-2 size-[17px]" />
        </Button>

        {activeFilterChips.map((chip) => (
          <Pressable
            key={chip.key}
            role="button"
            onPress={chip.onRemove}
            className="bg-primary h-11 flex-row items-center gap-1.5 rounded-full pr-3 pl-4"
          >
            <Text className="text-primary-foreground text-sm font-semibold">
              {chip.label}
            </Text>
            <Icon as={X} className="text-primary-foreground size-3.5" />
          </Pressable>
        ))}

        {activeFilterCount > 1 ? (
          <Button
            variant="ghost"
            className="h-11 rounded-full px-4"
            onPress={clearFilters}
          >
            <Text className="text-text-3 text-sm">Clear</Text>
          </Button>
        ) : null}
      </View>

      {isLoading ? <LoadingState className="mt-4" /> : null}

      {isUnavailable ? (
        // The app is offline-first: everything except search keeps working,
        // so point at what does rather than only offering a retry.
        <ErrorState
          className="mt-4"
          title="Search needs a connection"
          message="Your saved exercises, templates and history all work offline."
          onRetry={() => void refetch()}
          actions={[
            { label: "Saved exercises", onPress: () => router.push("/saved" as Href) },
            { label: "Create custom exercise", onPress: () => router.push("/exercise/new") },
          ]}
        />
      ) : isError ? (
        <ErrorState
          className="mt-4"
          title="Couldn't load exercises"
          message="The exercise service returned an error."
          onRetry={() => void refetch()}
        />
      ) : null}

      {!isLoading && !isError && items.length === 0 ? (
        <EmptyState
          className="mt-4"
          message={
            debouncedQuery
              ? "No exercises found. Try another keyword."
              : "Type an exercise name to start searching."
          }
          actions={
            debouncedQuery
              ? [
                  {
                    label: "Create custom exercise",
                    onPress: () =>
                      router.push({
                        pathname: "/exercise/new",
                        params: { initialName: debouncedQuery },
                      }),
                  },
                ]
              : []
          }
        />
      ) : null}

      <View className="mt-4 gap-2">
        {!isLoading && !isError && items.length > 0 ? (
          <View className="flex-row items-center justify-between">
            <Text variant="sectionLabel">{`${total} RESULTS`}</Text>
            <Text variant="microLabel">{`PAGE ${page} / ${totalPages}`}</Text>
          </View>
        ) : null}
        <FlashList
          className="-mx-4"
          data={items}
          keyExtractor={(exercise) => String(exercise.wgerExerciseId)}
          contentContainerStyle={{ paddingBottom: 8 }}
          renderItem={({ item: exercise }) => (
            <ExerciseRow
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
              <LoadingState className="mt-2" label="Loading page" />
            ) : !isLoading && !isError && items.length > 0 ? (
              <View className="mt-4 flex-row gap-2 px-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={!previousPage}
                  onPress={() => {
                    if (!previousPage) return;
                    setPendingPage(previousPage);
                    setPage(previousPage);
                  }}
                >
                  <Text>Previous</Text>
                </Button>

                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={!nextPage}
                  onPress={() => {
                    if (!nextPage) return;
                    setPendingPage(nextPage);
                    setPage(nextPage);
                  }}
                >
                  <Text>Next</Text>
                </Button>
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
            prev.includes(id)
              ? prev.filter((item) => item !== id)
              : [...prev, id],
          )
        }
        onToggleEquipment={(id) =>
          setSelectedEquipmentIds((prev) =>
            prev.includes(id)
              ? prev.filter((item) => item !== id)
              : [...prev, id],
          )
        }
        onToggleMuscle={(id) =>
          setSelectedMuscleIds((prev) =>
            prev.includes(id)
              ? prev.filter((item) => item !== id)
              : [...prev, id],
          )
        }
        onClearAll={clearFilters}
      />
    </CustomScreen>
  );
}
