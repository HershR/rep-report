import { FlatList, TouchableOpacity, View } from "react-native";
import React from "react";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import { deleteRoutine, getRoutineById } from "@/src/db/dbHelpers";
import useFetch from "@/src/services/useFetch";
import { drizzle } from "drizzle-orm/expo-sqlite";
import {
  Link,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "@/src/db/schema";
import ActivityLoader from "@/src/components/ActivityLoader";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import ExerciseImage from "@/src/components/ExerciseImage";
import { toUpperCase } from "@/src/services/textFormatter";
import { Text } from "@/src/components/ui/text";
import { Button } from "@/src/components/ui/button";
import { ArrowRight } from "@/src/lib/icons/ArrowRight";
import ConfirmAlert from "@/src/components/ConfirmAlert";
import { dateNameLong } from "@/src/utils/dateUtils";
const StartWorkout = () => {
  const {
    id: routineId,
  }: {
    id: string;
  } = useLocalSearchParams();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  db.execSync("PRAGMA foreign_keys = ON");

  const {
    data: routine,
    loading,
    refetch,
  } = useFetch(() => getRoutineById(drizzleDb, parseInt(routineId)), false);

  useFocusEffect(
    React.useCallback(() => {
      if (routineId != null) {
        refetch();
      }
    }, [routineId])
  );

  const onDelete = async () => {
    await deleteRoutine(drizzleDb, parseInt(routineId));
    router.back();
  };

  return (
    <SafeAreaWrapper>
      <Button
        variant={"ghost"}
        size={"icon"}
        onPress={router.back}
        className="z-50"
      >
        <ArrowRight size={32} className="rotate-180 color-primary mb-4" />
      </Button>
      {loading ? (
        <ActivityLoader />
      ) : (
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>{routine?.name}</CardTitle>

            {routine?.routineSchedule ? (
              <View className="flex-row flex-wrap">
                {routine.routineSchedule.map((x, index) => (
                  <CardDescription key={x.id} className="font-medium">
                    {dateNameLong[x.day]}
                    {index < routine.routineSchedule.length - 1 ? " | " : ""}
                  </CardDescription>
                ))}
              </View>
            ) : null}
            {routine?.description && (
              <CardDescription>{routine?.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <Separator />
          </CardContent>
          <CardContent className="flex-1">
            <FlatList
              // ref={listRef}
              data={routine?.routineExercises.map((x) => x.exercise)}
              keyExtractor={(item, index) => `${index}_${item.id}`}
              showsVerticalScrollIndicator={false}
              contentContainerClassName="gap-y-4"
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
                      <Button
                        className="flex"
                        onPress={() =>
                          router.push({
                            pathname: "../workout/create/[id]",
                            params: {
                              id: 0,
                              exerciseId: item.id,
                              exerciseName: item.name,
                              collectionId: routine?.id,
                            },
                          })
                        }
                      >
                        <Text>Start</Text>
                      </Button>
                    </View>
                  </Card>
                );
              }}
            />
          </CardContent>
          <CardContent>
            <Separator />
          </CardContent>
          <CardFooter className="flex-row gap-x-2">
            <View className="flex-1">
              <ConfirmAlert
                title="Delete Routine"
                trigger={<Text>Delete</Text>}
                triggerProps={{ variant: "destructive" }}
                description={"This action can not be undone"}
                onConfirm={onDelete}
                onCancel={() => {}}
              />
            </View>
            <View className="flex-1">
              <Button
                onPress={() => router.push(`/routine/update/${routine?.id}`)}
              >
                <Text>Edit</Text>
              </Button>
            </View>
          </CardFooter>
        </Card>
      )}
    </SafeAreaWrapper>
  );
};

export default StartWorkout;
