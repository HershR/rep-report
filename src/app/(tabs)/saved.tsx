import { FlatList, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
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
import { desc, eq } from "drizzle-orm";
import SearchBar from "@/src/components/SearchBar";
import { useRouter } from "expo-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import ExerciseList from "@/src/components/lists/ExerciseList";
import ActivityLoader from "@/src/components/ActivityLoader";
import { Button } from "@/src/components/ui/button";
import { CircleX } from "~/lib/icons/CircleX";

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
    drizzleDb.query.workoutRoutines.findMany({
      orderBy: (routines, { desc }) => [desc(routines.last_updated)],
      with: { routineExercises: true },
    })
  );
  useEffect(() => {
    if (routineError) {
      console.log(routineError);
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
        <View className="mb-4">
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
            <>
              {/* <CardTitle className="ml-4 mb-2">Favorites:</CardTitle> */}
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
            </>
          )}
        </TabsContent>
        <TabsContent className="flex-1" value="routines">
          {!routinesLoaded ? (
            <ActivityLoader />
          ) : (
            <View className="flex-1 justify-center items-center">
              {/* <Text className="text-lg text-muted-foreground">
              Routines feature coming soon!
            </Text> */}

              <FlatList
                className="w-full"
                data={
                  searchQuery
                    ? routines.filter((x) =>
                        x.name.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                    : routines
                }
                keyExtractor={(item) => item.id.toString()}
                contentContainerClassName="gap-y-4"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => router.push(`/routine/${item.id}`)}
                  >
                    <Card className="w-full flex-row justify-between items-center">
                      <CardHeader>
                        <CardTitle>{item.name}</CardTitle>
                        <CardDescription>
                          Exercises: {item?.routineExercises?.length}
                        </CardDescription>
                        <CardDescription>
                          {item.description
                            ? item.description
                            : "No Description"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent></CardContent>
                    </Card>
                  </TouchableOpacity>
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
