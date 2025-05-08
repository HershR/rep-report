import { FlatList, TouchableOpacity, View } from "react-native";
import React from "react";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import { getRoutineById } from "@/src/db/dbHelpers";
import useFetch from "@/src/services/useFetch";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { Link, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "@/src/db/schema";
import ActivityLoader from "@/src/components/ActivityLoader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import ExerciseImage from "@/src/components/ExerciseImage";
import { toUpperCase } from "@/src/services/textFormatter";
import { index } from "drizzle-orm/gel-core";
import { CircleX } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";
import { Button } from "@/src/components/ui/button";
const StartWorkout = () => {
  const {
    id: routineId,
  }: {
    id: string;
  } = useLocalSearchParams();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  db.execSync("PRAGMA foreign_keys = ON");

  const { data: routine, loading } = useFetch(() =>
    getRoutineById(drizzleDb, parseInt(routineId))
  );

  return (
    <SafeAreaWrapper>
      {loading ? (
        <ActivityLoader />
      ) : (
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>{routine?.name}</CardTitle>
            {routine?.description && (
              <CardDescription>{routine?.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <Separator />
          </CardContent>
          <CardContent>
            <FlatList
              // ref={listRef}
              data={routine?.routineExercises.map((x) => x.exercise)}
              keyExtractor={(item, index) => `${index}_${item.id}`}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => (
                <View className="h-2">
                  <Separator />
                </View>
              )}
              renderItem={({ item }) => {
                return (
                  <Card
                    className={`flex-1 max-h-24 md:max-h-32 justify-center items-center py-1 px-2`}
                  >
                    <View className="flex-row w-full h-full justify-center items-center">
                      <Link href={`/exercise/${item.id}`} asChild>
                        <TouchableOpacity>
                          <ExerciseImage
                            image_uri={item.image || null}
                            containerClassname="h-full aspect-square justify-center items-center"
                            contextFit="contain"
                          ></ExerciseImage>
                        </TouchableOpacity>
                      </Link>
                      <View className="flex-1 mx-4">
                        <Text
                          numberOfLines={1}
                          className="text-left text-lg font-semibold"
                        >
                          {toUpperCase(item.name)}
                        </Text>
                        {item.category && <Text>({item.category})</Text>}
                      </View>
                      <Button className="flex">
                        <Text>Start</Text>
                      </Button>
                    </View>
                  </Card>
                );
              }}
            />
          </CardContent>
        </Card>
      )}
    </SafeAreaWrapper>
  );
};

export default StartWorkout;
