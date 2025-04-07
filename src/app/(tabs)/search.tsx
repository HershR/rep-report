import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import useFetch from "@/src/services/useFetch";
import { searchExercise } from "@/src/services/api";
import SearchBar from "@/src/components/SearchBar";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchExerciseCard from "@/src/components/SearchExerciseCard";
import { Picker } from "@react-native-picker/picker";
import { wgerCategories } from "@/src/constants/excerciseCategory";
const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("none");
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
  const pickerOptions = () => {
    const style = { fontSize: 15, borderWidth: 2 };
    return [
      <Picker.Item key={"none"} label="None" value={"none"} style={style} />,
      ...Object.values(wgerCategories).map((x) => (
        <Picker.Item style={style} label={x} value={x} key={x} />
      )),
    ];
  };
  return (
    <View className="flex-1 bg-secondary">
      <SafeAreaView className="flex-1 mx-8 my-10">
        <FlatList
          data={
            category !== "none"
              ? exercies?.filter((x) => x.data.category === category)
              : exercies
          }
          renderItem={({ item }) => <SearchExerciseCard {...item} />}
          keyExtractor={(item) => item.data.id.toString()}
          className=""
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "center",
            gap: 16,
            marginVertical: 16,
          }}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={
            <>
              <View className="flex flex-row justify-center items-center my-5 gap-x-2">
                <View className="w-[60%]">
                  <SearchBar
                    placeholder="Search exercise..."
                    value={searchQuery}
                    onChangeText={(text: string) => {
                      setSearchQuery(text);
                    }}
                    onPress={() => {}}
                  />
                </View>

                <View className="flex-1 bg-gray-300 rounded-full">
                  <Picker
                    prompt="Select Category"
                    selectedValue={category}
                    onValueChange={(item) => {
                      setCategory(item);
                    }}
                    itemStyle={{ fontSize: 5, color: "#2A2E3C" }}
                  >
                    {pickerOptions()}
                  </Picker>
                </View>
              </View>
              {loading ? (
                <ActivityIndicator
                  size={"large"}
                  color={"#2A2E3C"}
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
                  {searchQuery.trim() ? "No Exercise Found" : "Search"}
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
