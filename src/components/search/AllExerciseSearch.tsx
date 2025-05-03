import { View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import useFetch from "@/src/services/useFetch";
import { fetchExcercises } from "@/src/services/api";
import SearchBar from "@/src/components/SearchBar";
import ExerciseList from "@/src/components/lists/ExerciseList";
import wgerCategories from "@/src/constants/excerciseCategory";
import { wgerEquipment } from "@/src/constants/excerciseEquipment";
import { wgerMuscles } from "@/src/constants/exerciseMuscles";
import { Text } from "../ui/text";
import FilterChip from "../FilterChip";
import SectionedDropdown from "../SectionedDropdown";
import { Button } from "../ui/button";

const categories = Object.entries(wgerCategories).map((x) => {
  return { value: x[0], label: x[1] };
});

const equipment = Object.entries(wgerEquipment).map((x) => {
  return { value: x[0], label: x[1] };
});

const muscles = wgerMuscles.map((x) => {
  return {
    value: x.id.toString(),
    label: x.name_en ? `${x.name_en}(${x.name})` : x.name,
  };
});

const AllExerciseSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedMucles, setSelectedMucles] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const fetchAmount = 20;
  const {
    data: exerciseInfo,
    loading,
    error,
    refetch: loadExercise,
    reset,
  } = useFetch(
    () =>
      fetchExcercises({
        category: selectedCategory || "",
        equipment: selectedEquipment,
        muscles: selectedMucles,
        offset: page,
        limit: fetchAmount,
      }),
    false
  );

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      await loadExercise();
      // if (searchQuery.trim()) {
      // } else {
      //   reset();
      // }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedCategory, selectedEquipment, selectedMucles, page]);

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

        <SectionedDropdown
          sections={[
            {
              name: "Categories",
              type: "single",
              items: categories,
              onSelect: (value) => setSelectedCategory(value),
            },
            {
              name: "Equipment",
              type: "single",
              items: equipment,
              onSelect: (value) => {
                if (value === null) {
                  setSelectedEquipment([]);
                  return;
                }
                const index = selectedEquipment?.indexOf(value);
                if (index < 0) {
                  setSelectedEquipment([...selectedEquipment, value]);
                } else {
                  setSelectedEquipment((prev) =>
                    prev.filter((x) => x !== value)
                  );
                }
              },
            },
            {
              name: "Muscle Groups",
              type: "single",
              items: muscles,
              onSelect: (value) => {
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
              },
            },
          ]}
          selectedItems={[
            selectedCategory ? [selectedCategory] : [],
            selectedEquipment,
            selectedMucles,
          ]}
        />
      </View>
      <View className="flex-row flex-wrap gap-2">
        {selectedCategory !== null ? (
          <FilterChip
            value={selectedCategory}
            label={
              categories.find((x) => x.value === selectedCategory.toString())
                ?.label!
            }
            onPress={() => setSelectedCategory(null)}
          />
        ) : null}
        {selectedEquipment.map((value) => (
          <FilterChip
            key={value}
            value={value}
            label={equipment.find((y) => y.value === value.toString())?.label!}
            onPress={() =>
              setSelectedEquipment((prev) => prev.filter((x) => x !== value))
            }
          />
        ))}
        {selectedMucles.map((value) => {
          const muscle = wgerMuscles.find(
            (y) => y.id.toString() === value.toString()
          );

          return (
            <FilterChip
              key={value}
              value={value}
              label={muscle?.name!}
              onPress={() =>
                setSelectedMucles((prev) => prev.filter((x) => x !== value))
              }
            />
          );
        })}
        {selectedCategory ||
        selectedEquipment.length > 0 ||
        selectedMucles.length > 0 ? (
          <FilterChip
            value={"-1"}
            label={"Clear All"}
            onPress={function (): void {
              setSelectedCategory(null);
              setSelectedEquipment([]);
              setSelectedMucles([]);
            }}
          />
        ) : null}
      </View>
      {error ? (
        <Text className="text-destructive px-5 my-3">
          Error: {error.message}
        </Text>
      ) : (
        <>
          {/* <View className="flex-row">{paginationChips()}</View> */}
          <ExerciseList
            exercises={infoToExercise(exerciseInfo?.results || []).filter(
              (x) => {
                if (searchQuery) {
                  return x.name
                    .toLowerCase()
                    .includes(searchQuery.toLocaleLowerCase());
                } else {
                  return true;
                }
              }
            )}
            footerComp={
              <View>
                {loading && (
                  <ActivityIndicator
                    size={"large"}
                    color={"#2A2E3C"}
                    className="my-3"
                  />
                )}
              </View>
            }
            onEndReach={() => {
              const maxPages = Math.ceil(
                exerciseInfo?.count || 1 / fetchAmount
              );
              if (
                !loading &&
                page < maxPages - 1 &&
                exerciseInfo?.results.length == fetchAmount
              ) {
                setPage((prev) => prev + 1);
              }
            }}
          />
        </>
      )}
    </>
  );
};

export default AllExerciseSearch;
