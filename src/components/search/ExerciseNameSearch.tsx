import { View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import ExerciseList from "../lists/ExerciseList";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "../ui/select";
import { Text } from "../ui/text";
import wgerCategories from "@/src/constants/excerciseCategory";
import { searchExercise } from "@/src/services/api";
import useFetch from "@/src/services/useFetch";
import SearchBar from "@/src/components/SearchBar";
const ExerciseNameSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("");
  const [page, setPage] = useState(0);

  const {
    data: exerciseSuggestions,
    loading: loading,
    error: error,
    refetch: loadExercise,
    reset,
  } = useFetch(() => searchExercise({ query: searchQuery }), false);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadExercise();
      } else {
        reset();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const selectItems = () => {
    const items = Object.entries(wgerCategories).map(([key, value]) => {
      return <SelectItem key={key} label={value} value={value}></SelectItem>;
    });
    return items;
  };

  function suggestionToExercise(
    suggestions: ExerciseSuggestion[]
  ): Omit<Exercise, "is_favorite">[] {
    const exercies = suggestions.map((x) => {
      return {
        ...x.data,
        id: x.data.base_id,
        image: "https://wger.de/" + x.data.image,
      };
    });

    if (!!category) {
      return exercies.filter((x) => x.category === category);
    }

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
        <Select
          className="w-[35%] md:w-[25%]"
          defaultValue={{ value: category, label: "None" }}
          onValueChange={(item) => setCategory(item!.value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              className="text-foreground text-lg"
              placeholder="Select Muscle Group"
            />
          </SelectTrigger>
          <SelectContent align="center">
            <SelectGroup>
              <SelectItem key={"none"} value={""} label={"None"}></SelectItem>
              {selectItems()}
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
      <>
        {!loading &&
        !error &&
        searchQuery.trim() &&
        exerciseSuggestions &&
        exerciseSuggestions?.length > 0 ? (
          <Text className="text-xl text-muted-foreground font-bold">
            Search Results for <Text className=" text-xl">{searchQuery}</Text>
          </Text>
        ) : null}
      </>
      {loading ? (
        <ActivityIndicator size={"large"} color={"#2A2E3C"} className="my-3" />
      ) : error ? (
        <Text className="text-destructive px-5 my-3">
          Error: {error.message}
        </Text>
      ) : (
        <ExerciseList
          exercises={suggestionToExercise(exerciseSuggestions || []).sort(
            (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())
          )}
          currentPage={page}
          pageSize={20}
          onPageChange={(page) => setPage(page)}
          emptyListComp={<Text>No Exercise Found</Text>}
        />
      )}
    </>
  );
};

export default ExerciseNameSearch;
