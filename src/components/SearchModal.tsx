import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  FlatList,
  ActivityIndicator,
  Touchable,
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
interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
}

const SearchModal = ({
  visible,
  onClose,
  onSelectExercise,
}: SearchModalProps) => {
  const router = useRouter();
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
      <View className="flex-1 justify-center items-center bg-black/50">
        <Card className="w-11/12 bg-white rounded-lg p-5">
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
                <Text className="text-gray-500">No favorites found</Text>
              }
              data={favorites}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Link href={`/exercise/${item.id}`} asChild>
                  <TouchableOpacity
                    className="w-32"
                    onPress={() => {
                      //   onClose();
                      //   router.push(`/exercise/${item.id}`);
                    }}
                  >
                    <Card>
                      <CardContent className="p-2">
                        <ExerciseImage
                          image_uri={!!item.image ? `${item.image}` : null}
                          imageClassname={`w-full aspect-square rounded-md bg-white`}
                          textClassname={"text-xl text-black text-center"}
                        />
                        <Text numberOfLines={1} className="text-base">
                          {item.name}
                        </Text>
                        <Button
                          onPress={() => {
                            onSelectExercise(item);
                          }}
                        >
                          <Text>Add</Text>
                        </Button>
                      </CardContent>
                    </Card>
                  </TouchableOpacity>
                </Link>
              )}
              ItemSeparatorComponent={() => <View className="w-4" />}
            ></FlatList>
          </CardContent>
          <CardContent>
            <Text className="text-lg font-bold mb-4">Search Exercises</Text>
            <Input
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              placeholder="Search for exercises..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <FlatList
                data={exercises}
                keyExtractor={(item) => item.data.base_id.toString()}
                renderItem={({ item }) => (
                  <Button
                    className="p-3"
                    onPress={() => {
                      onSelectExercise({ ...item.data, is_favorite: false });
                      onClose();
                    }}
                  >
                    <Text className="text-base">{item.data.name}</Text>
                  </Button>
                )}
              />
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="mt-4 p-3"
              variant={"destructive"}
              onPress={onClose}
            >
              <Text className="font-bold text-center">Close</Text>
            </Button>
          </CardFooter>
        </Card>
      </View>
    </Modal>
  );
};

export default SearchModal;
