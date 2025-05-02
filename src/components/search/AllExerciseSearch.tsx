import { View, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import useFetch from "@/src/services/useFetch";
import { fetchExcercises } from "@/src/services/api";
import SearchBar from "@/src/components/SearchBar";
import ExerciseList from "@/src/components/lists/ExerciseList";
import wgerCategories from "@/src/constants/excerciseCategory";
import { wgerEquipment } from "@/src/constants/excerciseEquipment";
import { wgerMuscles } from "@/src/constants/exerciseMuscles";
import { Text } from "../ui/text";
import FilterChip from "../FilterChip";
import MultiSelectDropdown from "../MultiSelectDropdown";
const categories = Object.entries(wgerCategories).map((x) => {
  return { value: x[0], label: x[1] };
});

const equipment = Object.entries(wgerEquipment).map((x) => {
  return { value: x[0], label: x[1] };
});

const muscles = wgerMuscles.map((x) => {
  return { value: x.id.toString(), label: x.name };
});

const AllExerciseSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setCategory] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedMucles, setSelectedMucles] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const {
    data: exerciseInfo,
    loading,
    error,
    refetch: loadExercise,
    reset,
  } = useFetch(() => fetchExcercises(), false);

  function infoToExercise(
    info: ExerciseInfo[]
  ): Omit<Exercise, "is_favorite">[] {
    const exercies = info.map((info) => {
      return {
        id: info.id,
        name: info.translations.find((x) => x.language === 2)?.name || "",
        category: info.category.name,
        image: info.images?.[0]?.image || null,
      };
    });

    return exercies;
  }
  return (
    <>
      <View className="flex-row w-full justify-center items-center gap-x-2 mb-4">
        <View className="flex-1">
          <SearchBar
            placeholder="Search exercise..."
            value={searchQuery}
            onChangeText={(text: string) => {
              setSearchQuery(text);
            }}
            onPress={() => {}}
          />
        </View>

        <View className="w-[35%] md:w-[25%]">
          <MultiSelectDropdown
            placeholder="Select Category"
            options={categories}
            selectedItems={selectedCategory ? [selectedCategory] : []}
            onSelect={(value) => setCategory(value)}
          />
        </View>
      </View>
      <View className="flex-row w-full justify-center items-center gap-x-2 mb-4">
        <View className="flex-1">
          <MultiSelectDropdown
            placeholder="Select Equipment"
            options={equipment}
            selectedItems={selectedEquipment}
            onSelect={(value) => {
              if (value === null) {
                setSelectedEquipment([]);
                return;
              }
              const index = selectedEquipment?.indexOf(value);
              if (index < 0) {
                setSelectedEquipment([...selectedEquipment, value]);
              } else {
                setSelectedEquipment((prev) => prev.filter((x) => x !== value));
              }
            }}
          />
        </View>
        <View className="flex-1">
          <MultiSelectDropdown
            placeholder="Select Muscles"
            options={muscles}
            selectedItems={selectedMucles}
            onSelect={(value) => {
              if (value === null) {
                setSelectedMucles([]);
                return;
              }
              const index = selectedMucles?.indexOf(value);
              if (index < 0) {
                setSelectedMucles([...selectedMucles, value]);
              } else {
                setSelectedMucles((prev) => prev.filter((x) => x !== value));
              }
            }}
          />
        </View>
      </View>
      <View className="flex-row">
        {selectedCategory !== null ? (
          <FilterChip
            value={selectedCategory}
            label={
              categories.find((x) => x.value === selectedCategory.toString())
                ?.label!
            }
            onPress={() => setCategory(null)}
          />
        ) : null}
      </View>
      {!!loading &&
        exerciseInfo &&
        // <ExerciseList exercises={infoToExercise(exerciseInfo) || []} />
        infoToExercise(exerciseInfo.results).map((x) => (
          <Text key={x.id}>{x.name}</Text>
        ))}
      {loading ? (
        <ActivityIndicator size={"large"} color={"#2A2E3C"} className="my-3" />
      ) : error ? (
        <Text className="text-destructive px-5 my-3">
          Error: {error.message}
        </Text>
      ) : (
        <ExerciseList exercises={infoToExercise(exerciseInfo?.results || [])} />
      )}
    </>
  );
};

export default AllExerciseSearch;
