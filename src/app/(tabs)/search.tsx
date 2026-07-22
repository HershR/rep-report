import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { ActivityIndicator, Pressable, View } from "react-native";
import { FlashList } from "@shopify/flash-list";

import { CustomScreen } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
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
import { THEME } from "@/lib/theme";

export default function SearchScreen() {
  const { colorScheme: scheme } = useColorScheme();
  const colors = THEME[scheme ?? "light"];
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
      <Text variant="h2">Search</Text>
      <Text variant="muted">Find exercises from WGER.</Text>

      <View className="border-input bg-background mt-4 flex-row items-center gap-2 rounded-md border-2 px-3">
        <Icon as={Search} className="text-muted-foreground" />
        <Input
          className="flex-1 border-0 px-0 shadow-none"
          value={query}
          onChangeText={onChangeQuery}
          placeholder="Search exercises"
        />
      </View>

      <View className="mt-4 flex-row items-center justify-between">
        <Button variant="outline" onPress={() => setFilterModalVisible(true)}>
          <Text>Filters</Text>
          {activeFilterCount > 0 ? (
            <Badge variant="secondary">
              <Text>{activeFilterCount}</Text>
            </Badge>
          ) : null}
        </Button>

        {activeFilterCount > 0 ? (
          <Button variant="ghost" size="sm" onPress={clearFilters}>
            <Text>Clear</Text>
          </Button>
        ) : null}
      </View>

      {activeFilterChips.length > 0 ? (
        <View className="mt-3 flex-row flex-wrap gap-2">
          {activeFilterChips.map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="flex-row items-center gap-1 pr-1"
            >
              <Text>{chip.label}</Text>
              <Pressable onPress={chip.onRemove} hitSlop={8}>
                <Icon as={X} className="text-secondary-foreground size-3" />
              </Pressable>
            </Badge>
          ))}
        </View>
      ) : null}

      {isLoading ? (
        <View className="mt-8 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null}

      {isError ? (
        <Card className="mt-4">
          <CardContent className="gap-2">
            <Text>We couldn&apos;t load exercises right now.</Text>
            <Text variant="muted">Check your connection and try again.</Text>
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              onPress={() => void refetch()}
            >
              <Text>Retry</Text>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !isError && items.length === 0 ? (
        <Card className="mt-4">
          <CardContent className="gap-2">
            <Text variant="muted">
              {debouncedQuery
                ? "No exercises found. Try another keyword."
                : "Type an exercise name to start searching."}
            </Text>
            {debouncedQuery ? (
              <Button
                variant="outline"
                size="sm"
                className="self-start"
                onPress={() =>
                  router.push({
                    pathname: "/exercise/new",
                    params: { initialName: debouncedQuery },
                  })
                }
              >
                <Text>Create Custom Exercise</Text>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <View className="mt-4 gap-2">
        {!isLoading && !isError && items.length > 0 ? (
          <View className="flex-row items-center justify-between">
            <Text variant="muted">{`Showing ${items.length} of ${total}`}</Text>
            <Text variant="muted">{`Page ${page} of ${totalPages}`}</Text>
          </View>
        ) : null}
        <FlashList
          data={items}
          keyExtractor={(exercise) => String(exercise.wgerExerciseId)}
          contentContainerStyle={{ gap: 8 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
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
              <View className="mt-4 items-center gap-1">
                <ActivityIndicator size="small" color={colors.primary} />
                <Text variant="muted">Loading page...</Text>
              </View>
            ) : !isLoading && !isError && items.length > 0 ? (
              <View className="mt-4 flex-row gap-2">
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
