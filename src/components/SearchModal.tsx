import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Input } from "./ui/input";
import { Text } from "./ui/text";
import { Button } from "./ui/button";
import { searchExercise } from "../services/api";
import useFetch from "../services/useFetch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { getFavoriteExercises } from "../db/dbHelpers";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "../db/schema";
import ExerciseImage from "./ExerciseImage";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "./SearchBar";
import ActivityLoader from "./ActivityLoader";
interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
  onShowExercise: (id: number) => void;
}

const SearchModal = ({
  visible,
  onClose,
  onSelectExercise,
  onShowExercise,
}: SearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: exercises,
    loading: loading,
    error: error,
    refetch: loadExercise,
    reset,
  } = useFetch(() => searchExercise({ query: searchQuery }), false);

  const {
    data: favorites,
    loading: favoritesLoading,
    error: favoritesError,
  } = useFetch(() => getFavoriteExercises());

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

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <TouchableOpacity
        className="absolute left-0 top-0 right-0 bottom-0  bg-black/50"
        onPress={onClose}
      ></TouchableOpacity>
      <SafeAreaView className="flex-1 mx-2 my-4 justify-center items-center">
        <Card className="flex-1 w-11/12">
          <CardHeader>
            <CardTitle>Add Exercise</CardTitle>
          </CardHeader>
          <CardContent>
            <Text className="text-lg font-bold mb-2">Favorites:</Text>
            <FlatList
              horizontal
              data={favorites}
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 5 }}
              ItemSeparatorComponent={() => <View className="w-4" />}
              ListEmptyComponent={
                <Text className="text-muted-foreground">
                  No favorites found
                </Text>
              }
              renderItem={({ item }) => (
                <Card className="aspect-square h-40 md:h-52 p-2">
                  <TouchableOpacity
                    className="w-full h-full"
                    onPress={() => {
                      onShowExercise(item.id);
                    }}
                  >
                    <ExerciseImage
                      image_uri={!!item.image ? `${item.image}` : null}
                      contextFit="contain"
                    />
                    <Text numberOfLines={1} className="w-full text-center">
                      {item.name}
                    </Text>
                    <Button
                      onPress={() => {
                        onSelectExercise(item);
                      }}
                      size={"icon"}
                      className="self-center w-full"
                    >
                      <Text>+</Text>
                    </Button>
                  </TouchableOpacity>
                </Card>
              )}
            ></FlatList>
          </CardContent>
          <CardContent className="flex-1 gap-y-2">
            <Text className="text-lg font-bold">Search Exercises</Text>
            <SearchBar
              placeholder={""}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {loading ? (
              <ActivityLoader />
            ) : (
              <FlatList
                numColumns={2}
                showsVerticalScrollIndicator={false}
                data={exercises
                  ?.map((exercise) => exercise.data)
                  .sort((a, b) =>
                    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                  )}
                keyExtractor={(item) => item.base_id.toString()}
                columnWrapperClassName="justify-start gap-x-4 my-2"
                renderItem={({ item }) => (
                  <Card className="flex-1 aspect-square p-2">
                    <TouchableOpacity
                      className="flex-1"
                      onPress={() => {
                        onShowExercise(item.base_id);
                      }}
                    >
                      <ExerciseImage
                        image_uri={
                          !!item.image ? `https://wger.de/${item.image}` : null
                        }
                        contextFit="contain"
                      />
                      <Text numberOfLines={1} className="w-full text-center">
                        {item.name}
                      </Text>
                      <Button
                        onPress={() => {
                          onSelectExercise({
                            ...item,
                            image: item.image
                              ? "https://wger.de/" + item.image
                              : null,
                            is_favorite: false,
                            id: item.base_id,
                          });
                        }}
                        size={"icon"}
                        className="w-full"
                      >
                        <Text>+</Text>
                      </Button>
                    </TouchableOpacity>
                  </Card>
                )}
              />
            )}
          </CardContent>
          <CardFooter className="flex-row justify-end items-end gap-x-2">
            <Button className="flex-1 mt-4 p-3" onPress={onClose}>
              <Text className="font-bold text-center">Close</Text>
            </Button>
          </CardFooter>
        </Card>
      </SafeAreaView>
    </Modal>
  );
};

export default SearchModal;
