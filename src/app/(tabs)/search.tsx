import { View, FlatList, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import useFetch from "@/src/services/useFetch";
import { searchExercise } from "@/src/services/api";
import SearchBar from "@/src/components/SearchBar";
import { SafeAreaView } from "react-native-safe-area-context";
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
import ExerciseCard from "@/src/components/ExerciseCard";
import { useRouter } from "expo-router";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
const Search = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("");
  const {
    data: exercies,
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
          className="w-[35%]"
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
        exercies &&
        exercies?.length > 0 ? (
          <Text className="text-xl text-muted-foreground font-bold">
            Search Results for <Text className=" text-xl">{searchQuery}</Text>
          </Text>
        ) : null}
      </>
      {loading ? (
        <ActivityIndicator size={"large"} color={"#2A2E3C"} className="my-3" />
      ) : error ? (
        <Text className="text-red-500 px-5 my-3">Error: {error.message}</Text>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={
            !!category
              ? exercies?.filter((x) => x.data.category === category)
              : exercies
          }
          renderItem={({ item }) => (
            <ExerciseCard
              exercise={{
                ...item.data,
                image: `${
                  !!item.data.image
                    ? "https://wger.de/" + item.data.image
                    : null
                }`,
              }}
              onPress={() => router.push(`/exercise/${item.data.base_id!}`)}
              containerClassname="flex-1 aspect-square"
              textClassname="text-xl font-semibold"
            />
          )}
          keyExtractor={(item) => item.data.base_id.toString()}
          className=""
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginVertical: 16,
            gap: 16,
          }}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            !loading && !error ? (
              <View className="mt-10 px-5">
                <Text className="text-center text-primary">
                  {searchQuery.trim() ? "No Exercise Found" : "Search"}
                </Text>
              </View>
            ) : null
          }
        ></FlatList>
      )}
    </SafeAreaWrapper>
  );
};

export default Search;
