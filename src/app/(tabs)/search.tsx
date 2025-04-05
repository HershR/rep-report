import { View, Text, FlatList, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import useFetch from "@/src/services/useFetch";
import { searchExercise } from "@/src/services/api";
import SearchBar from "@/src/components/SearchBar";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchExerciseCard from "@/src/components/SearchExerciseCard";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: exercies,
    loading: loading,
    error: error,
    refetch: loadMovies,
    reset,
  } = useFetch(() => searchExercise({ query: searchQuery }), false);
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadMovies();
      } else {
        reset();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <View className="flex-1 bg-secondary">
      <SafeAreaView className="flex-1 mx-8 my-2">
        <FlatList
          data={exercies}
          renderItem={({ item }) => <SearchExerciseCard {...item} />}
          keyExtractor={(item) => item.data.id.toString()}
          className="px-5"
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "center",
            gap: 16,
            marginVertical: 16,
          }}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={
            <>
              <View className="my-5">
                <SearchBar
                  placeholder="Search exercise..."
                  value={searchQuery}
                  onChangeText={(text: string) => {
                    setSearchQuery(text);
                  }}
                  onPress={() => {}}
                />
              </View>
              {loading ? (
                <ActivityIndicator
                  size={"large"}
                  color={"#0000ff"}
                  className="my-3"
                />
              ) : null}
              {error ? (
                <Text className="text-red-500 px-5 my-3">
                  Error: {error.message}
                </Text>
              ) : null}
              {!loading &&
              !error &&
              searchQuery.trim() &&
              exercies &&
              exercies?.length > 0 ? (
                <Text className="text-xl text-gray-400 font-bold">
                  Search Results for{" "}
                  <Text className="text-accent">{searchQuery}</Text>
                </Text>
              ) : null}
            </>
          }
          ListEmptyComponent={
            !loading && !error ? (
              <View className="mt-10 px-5">
                <Text className="text-center text-accent">
                  {searchQuery.trim() ? "No Movies Found" : "Search"}
                </Text>
              </View>
            ) : null
          }
        ></FlatList>
      </SafeAreaView>
    </View>
  );
};

export default Search;
