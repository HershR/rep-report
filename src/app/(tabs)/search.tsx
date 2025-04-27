import { View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import useFetch from "@/src/services/useFetch";
import { searchExercise } from "@/src/services/api";
import SearchBar from "@/src/components/SearchBar";
import { wgerCategories } from "@/src/constants/excerciseCategory";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Text } from "@/src/components/ui/text";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import ExerciseList from "@/src/components/lists/ExerciseList";
const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("");
  const {
    data: exercieSuggestions,
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
    <SafeAreaWrapper>
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
        exercieSuggestions &&
        exercieSuggestions?.length > 0 ? (
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
          exercises={suggestionToExercise(exercieSuggestions || [])}
        />
      )}
    </SafeAreaWrapper>
  );
};

export default Search;
