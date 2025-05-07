import { View } from "react-native";
import React, { useState } from "react";
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
import { useRouter } from "expo-router";
import { CardTitle } from "@/src/components/ui/card";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import ExerciseList from "@/src/components/lists/ExerciseList";
import ActivityLoader from "@/src/components/ActivityLoader";
import { Button } from "@/src/components/ui/button";

const Saved = () => {
  const router = useRouter();

  const [tab, setTab] = useState("favorites");
  const [searchQuery, setSearchQuery] = useState("");

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
    <SafeAreaWrapper>
      <Tabs value={tab} onValueChange={setTab} className="flex-1">
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
                exercises={favorites}
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
          <View className="flex-1 justify-center items-center">
            {/* <Text className="text-lg text-muted-foreground">
              Routines feature coming soon!
            </Text> */}
            <Button
              onPress={() =>
                router.push({
                  pathname: "../routine/create",
                })
              }
            >
              <Text>Create new Workout</Text>
            </Button>
          </View>
        </TabsContent>
      </Tabs>
    </SafeAreaWrapper>
  );
};

export default Saved;
