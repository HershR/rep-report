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
import { Link } from "expo-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import ExerciseImage from "@/src/components/ExerciseImage";
import { toUpperCase } from "@/src/services/textFormatter";

const Saved = () => {
  const [tab, setTab] = useState("favorites");
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const { data: favorites, updatedAt: favoritesLoaded } = useLiveQuery(
    drizzleDb.query.exercises.findMany({
      where: (exercises) => eq(exercises.is_favorite, true),
      orderBy: (exercises, { desc }) => [desc(exercises.name)],
    })
  );

  return (
    <View className="flex-1 bg-secondary">
      <SafeAreaView className="flex-1 mx-8 mt-10 pb-20">
        <Tabs value={tab} onValueChange={setTab} className="flex-1 gap-y-4">
          <TabsList className="flex-row w-full">
            <TabsTrigger value="favorites" className="flex-1">
              <Text>Favorites</Text>
            </TabsTrigger>
            <TabsTrigger value="routines" className="flex-1">
              <Text>Routines</Text>
            </TabsTrigger>
          </TabsList>

          <SearchBar placeholder={""} value={""} />
          <TabsContent className="flex-1 gap-y-2" value="favorites">
            {!favoritesLoaded ? (
              <ActivityIndicator></ActivityIndicator>
            ) : (
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Favorites</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 gap-y-4">
                  <FlatList
                    numColumns={2}
                    data={favorites}
                    keyExtractor={(item) => item.id.toString()}
                    columnWrapperClassName="gap-x-4 justify-center items-center"
                    contentContainerClassName="px-4 gap-y-4 border-2"
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                      <Text className="text-center text-lg font-medium text-muted-foreground">
                        No favorites found.
                      </Text>
                    }
                    renderItem={({ item: exercise }) => {
                      const { id, name, category, image } = exercise;

                      return (
                        <Link href={`/exercise/${id}`} asChild>
                          <TouchableOpacity className="w-1/2 max-h-1/2">
                            <Card className="flex justify-center items-center px-2 pt-4">
                              <ExerciseImage
                                image_uri={image}
                                imageClassname={
                                  "w-full aspect-square rounded-md bg-white"
                                }
                                textClassname={"text-black text-xl text-center"}
                              ></ExerciseImage>
                              <Text
                                numberOfLines={1}
                                className="text-lg font-semibold mt-1"
                              >
                                {toUpperCase(name)}
                              </Text>
                              <Text className="absolute top-2 right-2 text-sm font-medium text-muted-foreground bg-accent rounded-full px-3">
                                {category}
                              </Text>
                            </Card>
                          </TouchableOpacity>
                        </Link>
                      );
                    }}
                  ></FlatList>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </SafeAreaView>
    </View>
  );
};

export default Saved;
