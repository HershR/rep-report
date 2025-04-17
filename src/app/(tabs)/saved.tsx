import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { Text } from "@/src/components/ui/text";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import * as schema from "@/src//db/schema";
import { eq } from "drizzle-orm";
import SearchBar from "@/src/components/SearchBar";
import { Link, useRouter } from "expo-router";
import { Card, CardTitle } from "@/src/components/ui/card";
import ExerciseImage from "@/src/components/ExerciseImage";
import { Button } from "@/src/components/ui/button";
import { Plus } from "@/src/lib/icons/Plus";
const Saved = () => {
  const [tab, setTab] = useState("favorites");
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const {
    data: favorites,
    updatedAt: favoritesLoaded,
    error,
  } = useLiveQuery(
    drizzleDb.query.exercises.findMany({
      where: (exercises) => eq(exercises.is_favorite, true),
      orderBy: (exercises, { asc }) => [asc(exercises.name)],
    })
  );

  return (
    <View className="flex-1 bg-secondary">
      <SafeAreaView className="flex-1 mx-8 mt-10">
        <Tabs value={tab} onValueChange={setTab} className="flex-1 gap-y-4">
          <TabsList className="flex-row w-full">
            <TabsTrigger value="favorites" className="flex-1">
              <Text>Favorites</Text>
            </TabsTrigger>
            <TabsTrigger value="routines" className="flex-1">
              <Text>Routines</Text>
            </TabsTrigger>
          </TabsList>

          <SearchBar
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={(text: string) => {
              setSearchQuery(text);
            }}
          />
          <TabsContent className="flex-1" value="favorites">
            {!favoritesLoaded ? (
              <ActivityIndicator></ActivityIndicator>
            ) : (
              <View className="flex-1">
                <CardTitle className="ml-4">Favorites:</CardTitle>
                <FlatList
                  numColumns={2}
                  showsVerticalScrollIndicator={false}
                  data={
                    searchQuery.length > 0
                      ? favorites.filter(
                          (x) =>
                            x.name
                              .toLowerCase()
                              .indexOf(searchQuery.toLowerCase()) > -1
                        )
                      : favorites
                  }
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item: exercise, index }) => {
                    const { id, name, category, image } = exercise;

                    return (
                      <Link href={`/exercise/${id}`} asChild>
                        <TouchableOpacity className="w-1/2">
                          <Card className="relative flex-1 justify-center items-center overflow-hidden">
                            <ExerciseImage
                              image_uri={image}
                              imageClassname={
                                "w-full aspect-square rounded-md bg-white"
                              }
                              textClassname={"text-black text-xl text-center"}
                            ></ExerciseImage>
                            <View
                              className=" absolute bottom-0 h-1/4 w-full justify-end"
                              style={{ backgroundColor: "#ffffffbb" }}
                            >
                              <View className="justify-center items-start ml-2 my-1">
                                <Text
                                  className="text-lg font-bold text-black"
                                  numberOfLines={1}
                                >
                                  {name}
                                </Text>
                                <Text className="text-md text-black">
                                  {" "}
                                  ({category})
                                </Text>
                              </View>
                            </View>
                          </Card>
                        </TouchableOpacity>
                      </Link>
                    );
                  }}
                  columnWrapperClassName="justify-between my-1 gap-x-2 px-2"
                  ListEmptyComponent={
                    !favoritesLoaded && !error ? (
                      <View className="mt-10 px-5">
                        <Text className="text-center text-primary">
                          No Exercise Found
                        </Text>
                      </View>
                    ) : null
                  }
                ></FlatList>
              </View>
            )}
          </TabsContent>
          <TabsContent className="flex-1" value="routines">
            <View className="flex-1 justify-center items-center">
              <Button
                className="flex-row items-center gap-x-2"
                onPress={() => router.push("/routine/create")}
              >
                <Text>Create Routine</Text>
                <Plus className="color-secondary" size={20} />
              </Button>
            </View>
          </TabsContent>
        </Tabs>
      </SafeAreaView>
    </View>
  );
};

export default Saved;
