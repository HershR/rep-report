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
import ExerciseCard from "@/src/components/ExerciseCard";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";

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
          placeholder={
            tab === "favorites" ? "Search favorites..." : "Search routines..."
          }
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
                    <ExerciseCard
                      exercise={exercise}
                      containerClassname="flex-1 max-w-[45%] aspect-square"
                      onPress={() => router.push(`/exercise/${exercise.id}`)}
                    />
                  );
                }}
                columnWrapperStyle={{
                  justifyContent: "space-between",
                  marginVertical: 16,
                  gap: 16,
                }}
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
            <Text className="text-lg text-muted-foreground">
              Routines feature coming soon!
            </Text>
          </View>
        </TabsContent>
      </Tabs>
    </SafeAreaWrapper>
  );
};

export default Saved;
