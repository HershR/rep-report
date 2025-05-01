import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import useFetch from "@/src/services/useFetch";
import { fetchExcercises } from "@/src/services/api";
import SearchBar from "../SearchBar";
import { FlatList } from "react-native-gesture-handler";
import ExerciseList from "../lists/ExerciseList";

const AllExerciseSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("");
  const [page, setPage] = useState(0);
  const {
    data: exerciseInfo,
    loading,
    error,
    refetch: loadExercise,
    reset,
  } = useFetch(() => fetchExcercises(), true);

  // useEffect(() => {
  //   const timeoutId = setTimeout(async () => {
  //     if (searchQuery.trim()) {
  //       await loadExercise();
  //     } else {
  //       reset();
  //     }
  //   }, 500);
  //   return () => clearTimeout(timeoutId);
  // }, [searchQuery]);

  useEffect(() => {
    if (loading === false) {
      console.log(exerciseInfo?.results?.[0]);
    } else {
      console.log("no data");
    }
  }, [loading]);

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
          {!!loading &&
            exerciseInfo &&
            // <ExerciseList exercises={infoToExercise(exerciseInfo) || []} />
            infoToExercise(exerciseInfo.results).map((x) => (
              <Text key={x.id}>{x.name}</Text>
            ))}
          {loading ? (
            <ActivityIndicator
              size={"large"}
              color={"#2A2E3C"}
              className="my-3"
            />
          ) : error ? (
            <Text className="text-destructive px-5 my-3">
              Error: {error.message}
            </Text>
          ) : (
            <ExerciseList
              exercises={infoToExercise(exerciseInfo?.results || [])}
            />
          )}
        </View>
      </View>
    </>
  );
};

export default AllExerciseSearch;
