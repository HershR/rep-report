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
import SectionedDropdown, { SectionItem } from "../SectionedDropdown";
import apiData from "@/src/data/exerciseInfo";

const categories = Object.entries(wgerCategories).map((x) => {
  return { id: x[0], name: x[1] };
});

const equipment = Object.entries(wgerEquipment).map((x) => {
  return { id: x[0], name: x[1] };
});

const muscles = wgerMuscles.map((x) => {
  return {
    id: x.id.toString(),
    name: x.name_en ? `${x.name_en}(${x.name})` : x.name,
  };
});

const AllExerciseSearch = () => {
  const [fileredData, setFilteredData] = useState<ExerciseInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedMucles, setSelectedMucles] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const fetchAmount = 999;
  const {
    data: exerciseInfo,
    loading: exerciseLoading,
    error,
  } = useFetch(
    () =>
      fetchExcercises({
        offset: 0,
        limit: fetchAmount,
      }),
    true
  );

  useEffect(() => {
    if (exerciseLoading || exerciseInfo?.results === undefined) {
      return;
    }
    const newData = filterExercise(
      exerciseInfo?.results || [],
      searchQuery,
      selectedCategory,
      selectedEquipment,
      selectedMucles
    );
    setFilteredData(newData);
  }, [exerciseLoading, exerciseInfo?.results]);

  useEffect(() => {
    if (exerciseLoading) {
      return;
    }
    if (
      searchQuery === "" &&
      selectedCategory.length === 0 &&
      selectedEquipment.length === 0 &&
      selectedMucles.length === 0
    ) {
      setFilteredData(exerciseInfo?.results ?? []);
      return;
    }
    const timeoutId = setTimeout(async () => {
      const newData = filterExercise(
        exerciseInfo?.results || [],
        searchQuery,
        selectedCategory,
        selectedEquipment,
        selectedMucles
      );
      setFilteredData(newData);
      setPage(0);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, selectedEquipment, selectedMucles]);

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

  function filterExercise(
    data: ExerciseInfo[],
    searchQuery: string = "",
    category: string[] = [],
    equipment: string[] = [],
    muscles: string[] = []
  ) {
    console.log("Filter with: ", searchQuery, category, equipment, muscles);
    return data.filter((x) => {
      if (
        category.length > 0 &&
        category.includes(x.category.id.toString()) === false
      ) {
        return false;
      }
      if (
        equipment.length > 0 &&
        x.equipment.some((r) => equipment.includes(r.id.toString())) === false
      ) {
        return false;
      }
      if (
        muscles.length > 0 &&
        (x.muscles.some((r) => muscles.includes(r.id.toString())) ||
          x.muscles_secondary.some((r) =>
            muscles.includes(r.id.toString())
          )) === false
      ) {
        return false;
      }

      const description = x.translations.find((y) => y.language === 2);
      if (
        !!searchQuery &&
        description?.name.toLowerCase().includes(searchQuery.toLowerCase()) ===
          false
      ) {
        return false;
      }
      return true;
    });
  }

  const filterSection: SectionItem[] = [
    {
      id: 0,
      name: "Categories",
      type: "single",
      items: categories,
    },
    {
      id: 1,
      name: "Equipment",
      type: "single",
      items: equipment,
    },
    {
      id: 2,
      name: "Muscle Groups",
      type: "single",
      items: muscles,
    },
  ];
  const clearAllChip =
    selectedCategory.length > 0 ||
    selectedEquipment.length > 0 ||
    selectedMucles.length > 0 ? (
      <FilterChip
        value={"-1"}
        label={"Clear All"}
        onPress={function (): void {
          setSelectedCategory([]);
          setSelectedEquipment([]);
          setSelectedMucles([]);
        }}
      />
    ) : null;
  function onFilterChange(id: number, value: string | null): void {
    switch (id) {
      case 0:
        if (value === null) {
          setSelectedCategory([]);
          return;
        }
        if (!selectedCategory.includes(value)) {
          setSelectedCategory([...selectedCategory, value]);
        } else {
          setSelectedCategory((prev) => prev.filter((x) => x !== value));
        }
        break;
      case 1:
        if (value === null) {
          setSelectedEquipment([]);
          return;
        }
        if (!selectedEquipment.includes(value)) {
          setSelectedEquipment([...selectedEquipment, value]);
        } else {
          setSelectedEquipment((prev) => prev.filter((x) => x !== value));
        }
        break;
      case 2:
        if (value === null) {
          setSelectedMucles([]);
          return;
        }
        if (!selectedMucles.includes(value)) {
          setSelectedMucles([...selectedMucles, value]);
        } else {
          setSelectedMucles((prev) => prev.filter((x) => x !== value));
        }
        break;
    }
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
          sections={filterSection}
          selectedItems={[selectedCategory, selectedEquipment, selectedMucles]}
          onSelect={onFilterChange}
        />
      </View>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {selectedCategory.map((value) => (
          <FilterChip
            key={value}
            value={value}
            label={categories.find((y) => y.id === value.toString())?.name!}
            onPress={() =>
              setSelectedCategory((prev) => prev.filter((x) => x !== value))
            }
          />
        ))}
        {selectedEquipment.map((value) => (
          <FilterChip
            key={value}
            value={value}
            label={equipment.find((y) => y.id === value.toString())?.name!}
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
              key={muscle?.name}
              value={value}
              label={muscle?.name!}
              onPress={() =>
                setSelectedMucles((prev) => prev.filter((x) => x !== value))
              }
            />
          );
        })}
        {clearAllChip}
      </View>
      {exerciseLoading ? (
        <ActivityIndicator size={"large"} color={"#2A2E3C"} className="my-3" />
      ) : error ? (
        <Text className="text-destructive px-5 my-3">
          Error: {error.message}
        </Text>
      ) : (
        <>
          <ExerciseList
            exercises={infoToExercise(fileredData || []).sort((a, b) =>
              a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            )}
            currentPage={page}
            pageSize={20}
            onPageChange={(page) => setPage(page)}
            emptyListComp={
              <View className="flex-1 items-center justify-center">
                <Text>No Exercise Found</Text>
              </View>
            }
          />
        </>
      )}
    </>
  );
};

export default AllExerciseSearch;
