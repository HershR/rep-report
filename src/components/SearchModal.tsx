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
import { Plus } from "../lib/icons/Plus";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "./SearchBar";
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
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
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
  } = useFetch(() => getFavoriteExercises(drizzleDb));

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
            <Text>Favorites:</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 5 }}
              className="flex"
              ListEmptyComponent={
                <Text className="text-muted-foreground">
                  No favorites found
                </Text>
              }
              data={favorites}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="w-32"
                  onPress={() => {
                    onShowExercise(item.id);
                  }}
                >
                  <Card>
                    <CardContent className="p-2 justify-center items-center gap-y-2">
                      <ExerciseImage
                        image_uri={!!item.image ? `${item.image}` : null}
                        imageClassname={`w-full aspect-square rounded-md bg-white`}
                        textClassname={"text-xl text-black text-center"}
                      />
                      <Text numberOfLines={1} className="w-full text-center">
                        {item.name}
                      </Text>
                      <Button
                        onPress={() => {
                          onSelectExercise(item);
                        }}
                        size={"icon"}
                      >
                        <Plus className="color-secondary" size={20} />
                      </Button>
                    </CardContent>
                  </Card>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View className="w-4" />}
            ></FlatList>
          </CardContent>
          <CardContent>
            <Text className="text-lg font-bold mb-4">Search Exercises</Text>
            <SearchBar
              placeholder={""}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </CardContent>
          <CardContent className="flex-1">
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <FlatList
                numColumns={2}
                showsVerticalScrollIndicator={false}
                data={exercises?.map((exercise) => exercise.data)}
                keyExtractor={(item) => item.base_id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="w-1/2 p-2"
                    onPress={() => {
                      onShowExercise(item.base_id);
                    }}
                  >
                    <Card className="flex-1 justify-center items-center overflow-hidden">
                      <ExerciseImage
                        image_uri={
                          !!item.image ? `https://wger.de/${item.image}` : null
                        }
                        imageClassname={`w-full aspect-square rounded-md bg-white`}
                        textClassname={"text-xl text-black text-center"}
                      />
                      <Text numberOfLines={1} className="w-full text-center">
                        {item.name}
                      </Text>
                      <Button
                        onPress={() => {
                          onSelectExercise({
                            ...item,
                            is_favorite: false,
                            id: item.base_id,
                          });
                        }}
                        size={"icon"}
                      >
                        <Plus className="color-secondary" size={20} />
                      </Button>
                    </Card>
                  </TouchableOpacity>
                )}
              />
            )}
          </CardContent>
          <CardFooter className="flex-row justify-end items-end gap-x-2">
            <Button className="flex-1 mt-4 p-3" onPress={onClose}>
              <Text className="font-bold text-center">Save</Text>
            </Button>
            <Button
              className="flex-1 mt-4 p-3"
              variant={"destructive"}
              onPress={onClose}
            >
              <Text className="font-bold text-center">Close</Text>
            </Button>
          </CardFooter>
        </Card>
      </SafeAreaView>
    </Modal>
  );
};

export default SearchModal;
