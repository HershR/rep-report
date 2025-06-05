import React, { useEffect, useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import SearchBar from "@/src/components/SearchBar";
import { useRouter } from "expo-router";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import ExerciseList from "@/src/components/lists/ExerciseList";
import ActivityLoader from "@/src/components/ActivityLoader";
//db
import { useSQLiteContext } from "expo-sqlite";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import * as schema from "@/src//db/schema";
import { eq } from "drizzle-orm";
//utils
import { dateNameLong } from "@/src/utils/dateUtils";
//ui
import { Text } from "@/src/components/ui/text";
import { Button } from "@/src/components/ui/button";
import { CircleX } from "~/lib/icons/CircleX";
import { Card, CardDescription, CardTitle } from "@/src/components/ui/card";
import { ChevronRight } from "@/src/lib/icons/ChevronRight";

const Saved = () => {
  const router = useRouter();

  const [tab, setTab] = useState("favorites");
  const [searchQuery, setSearchQuery] = useState("");

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const {
    data: favorites,
    updatedAt: favoritesLoaded,
    error: favoritesError,
  } = useLiveQuery(
    drizzleDb.query.exercises.findMany({
      where: (exercises) => eq(exercises.is_favorite, true),
      orderBy: (exercises, { asc }) => [asc(exercises.name)],
    })
  );

  const {
    data: routines,
    updatedAt: routinesLoaded,
    error: routineError,
  } = useLiveQuery(
    drizzleDb.query.routines.findMany({
      orderBy: (routines, { desc }) => [desc(routines.last_updated)],
      with: { routineExercises: true, routineSchedule: true },
    })
  );
  useEffect(() => {
    if (favoritesError) {
      console.log("Saved Favorites Fetch Error: ", favoritesError);
    }
  }, [favoritesError]);
  useEffect(() => {
    if (routineError) {
      console.log("Saved Routine Fetch Error: ", routineError);
    }
  }, [routineError]);

  return (
    <SafeAreaWrapper>
      <Tabs
        value={tab}
        onValueChange={(value) => {
          setSearchQuery("");
          setTab(value);
        }}
        className="flex-1"
      >
        <TabsList className="flex-row w-full max-w-[400px] self-center">
          <TabsTrigger value="favorites" className="flex-1">
            <Text>Favorites</Text>
          </TabsTrigger>
          <TabsTrigger value="routines" className="flex-1">
            <Text>Routines</Text>
          </TabsTrigger>
        </TabsList>
        <View className="my-4">
          <SearchBar
            placeholder={
              tab === "favorites" ? "Search favorites..." : "Search routines..."
            }
            value={searchQuery}
            onChangeText={(text: string) => {
              setSearchQuery(text);
            }}
          />
        </View>
        <TabsContent style={{ flex: 1 }} value="favorites">
          {!favoritesLoaded ? (
            <ActivityLoader />
          ) : (
            <View className="flex-1 justify-start">
              <ExerciseList
                exercises={
                  searchQuery
                    ? favorites.filter((x) =>
                        x.name.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                    : favorites
                }
                emptyListComp={
                  <View className="flex-1 items-center justify-center">
                    <Text>No Favorites Added</Text>
                  </View>
                }
              />
            </View>
          )}
        </TabsContent>
        <TabsContent className="flex-1" value="routines">
          {!routinesLoaded ? (
            <ActivityLoader />
          ) : (
            <View className="flex-1">
              <FlatList
                data={
                  searchQuery
                    ? routines.filter((x) =>
                        x.name.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                    : routines
                }
                keyExtractor={(item) => item.id.toString()}
                contentContainerClassName="gap-y-4"
                ListEmptyComponent={
                  <View className="flex-1 items-center justify-center">
                    <Text>No Routines</Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <Card className="flex-1 justify-center items-center p-4">
                    <TouchableOpacity
                      className="flex-row justify-between items-center"
                      onPress={() => router.push(`/routine/${item.id}`)}
                    >
                      <View className="flex-1 mx-4 max-h-32 overflow-hidden">
                        <CardTitle>{item.name}</CardTitle>
                        {item?.routineSchedule?.length > 0 && (
                          <CardDescription className="flex-row font-medium">
                            {item.routineSchedule
                              .map((x, index) => dateNameLong[x.day])
                              .join(" | ")}
                          </CardDescription>
                        )}

                        <CardDescription>
                          Exercises: {item?.routineExercises?.length}
                        </CardDescription>
                        {item.description && (
                          <CardDescription>{item.description}</CardDescription>
                        )}
                      </View>
                      <ChevronRight className="color-primary" size={30} />
                    </TouchableOpacity>
                  </Card>
                )}
              ></FlatList>
              <Button
                className="absolute bottom-0 right-2 rounded-full h-14 w-14"
                size={"icon"}
                onPress={() =>
                  router.push({
                    pathname: "../routine/create",
                  })
                }
              >
                <CircleX
                  size={40}
                  className="color-background rotate-45"
                ></CircleX>
              </Button>
            </View>
          )}
        </TabsContent>
      </Tabs>
    </SafeAreaWrapper>
  );
};

export default Saved;
