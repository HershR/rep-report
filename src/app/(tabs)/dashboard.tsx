import { FlatList, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import { useDate } from "@/src/context/DateContext";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import * as schema from "@/src//db/schema";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { desc, eq } from "drizzle-orm";
import ActivityLoader from "@/src/components/ActivityLoader";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { User } from "@/src/lib/icons/User";
import SearchBar from "@/src/components/SearchBar";
import { useRouter } from "expo-router";
import { workouts, exercises, Routine } from "@/src/db/schema";
import ExerciseList from "@/src/components/lists/ExerciseList";
import { ChevronRight } from "@/src/lib/icons/ChevronRight";
import { DateTime } from "luxon";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import CustomCarousel from "@/src/components/CustomCarousel";
import RecentExerciseList from "@/src/components/lists/RecentExerciseList";

interface RoutineWithExercise extends Routine {
  exercise: schema.Exercise[];
}

const Dashboard = () => {
  const { selectedDate, setSelectedDate } = useDate();
  const [todaysRoutines, setRoutines] = useState<RoutineWithExercise[]>([]);
  const router = useRouter();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const { width, height } = useSafeAreaFrame();

  const {
    data: routines,
    updatedAt: routinesLoaded,
    error: routineError,
  } = useLiveQuery(
    drizzleDb
      .select()
      .from(schema.routineSchedule)
      .where(eq(schema.routineSchedule.day, new Date().getDay() ?? 0))
      .leftJoin(
        schema.routines,
        eq(schema.routines.id, schema.routineSchedule.routine_id)
      )
      .leftJoin(
        schema.routineExercises,
        eq(
          schema.routineExercises.routine_id,
          schema.routineSchedule.routine_id
        )
      )
      .leftJoin(
        schema.exercises,
        eq(schema.exercises.id, schema.routineExercises.exercise_id)
      )
  );
  const {
    data: recentExercise,
    updatedAt: recentExerciseLoaded,
    error: recentExerciseError,
  } = useLiveQuery(
    drizzleDb
      .selectDistinct({
        id: workouts.exercise_id,
        name: exercises.name,
        image: exercises.image,
        category: exercises.category,
      })
      .from(workouts)
      .innerJoin(exercises, eq(workouts.exercise_id, exercises.id))
      .orderBy(desc(workouts.last_updated), desc(workouts.date))
      .limit(10)
  );

  useEffect(() => {
    if (routines) {
      const result: RoutineWithExercise[] = routines.reduce<
        RoutineWithExercise[]
      >((acc, d) => {
        const found = acc.find((a) => a.id === d.routines?.id);
        if (!found) {
          acc.push({ ...d.routines!, exercise: [d.exercises!] }); // not found, so need to add data property
        } else {
          found.exercise.push(d.exercises!); // if found, that means data property exists, so just push new element to found.data.
        }
        return acc;
      }, []);
      setRoutines(result);
    }
  }, [routines]);
  return (
    <SafeAreaWrapper>
      <View className="flex-1 gap-y-5">
        <View className="flex-row items-end gap-x-4">
          <Button
            className="rounded-full w-16 h-16"
            size={"icon"}
            variant={"secondary"}
          >
            <User className="color-primary" size={40} />
          </Button>
          <View className="mb-2">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              {DateTime.now().toFormat("LLL dd yyyy")}
            </CardDescription>
          </View>
        </View>

        {todaysRoutines ? (
          <View>
            <Text className="text-xl font-semibold mb-2">
              Scheduled Workout:
            </Text>

            <CustomCarousel
              data={todaysRoutines}
              width={width - 64}
              height={160}
              renderFunction={function (
                item: RoutineWithExercise,
                index?: number
              ) {
                return (
                  <View className="flex-1 justify-center mr-2">
                    <Card className="p-4">
                      <TouchableOpacity
                        className="flex-row justify-between items-center"
                        onPress={() => router.push(`/routine/${item.id}`)}
                      >
                        <View className="flex-1 mx-4 max-h-40 overflow-hidden">
                          <CardTitle>{item.name}</CardTitle>
                          <CardDescription numberOfLines={6}>
                            {item.exercise.map((x) => x.name + "\n")}
                          </CardDescription>
                        </View>
                        <ChevronRight className="color-primary" size={30} />
                      </TouchableOpacity>
                    </Card>
                  </View>
                );
              }}
            />
          </View>
        ) : (
          <Card className="bg-secondary border-none">
            <CardHeader>
              <CardTitle>No Routines</CardTitle>
              <CardDescription>
                You have no workouts scheduled for today.
              </CardDescription>
              <CardDescription>
                Press the button below to schedule a workout
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button>
                <Text>Create Routine</Text>
              </Button>
            </CardFooter>
          </Card>
        )}

        {!recentExerciseLoaded ? (
          <ActivityLoader />
        ) : recentExerciseError ? (
          <Text>Error</Text>
        ) : (
          <View className="flex">
            <Text className="text-xl font-semibold mb-2">Recent Exercise:</Text>
            <RecentExerciseList
              exercise={recentExercise}
              onPress={(id: number) => router.push(`/exercise/${id}`)}
            />
          </View>
        )}
        <View className="flex-1">
          <Card className="flex-1">
            <CardContent className="flex-1 justify-center items-center">
              <Text>More Coming Soon</Text>
            </CardContent>
          </Card>
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

export default Dashboard;
