import { View } from "react-native";
import DatePickerWithWeek from "@/src/components/datepicker/DatePickerWithWeek";
import SearchBar from "@/src/components/SearchBar";
import { useRouter } from "expo-router";
import { useDate } from "@/src/context/DateContext";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import * as schema from "@/src//db/schema";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Text } from "~/components/ui/text";
import { desc, eq } from "drizzle-orm";
import { workouts, exercises } from "@/src//db/schema";
import CompletedWorkoutList from "@/src/components/lists/CompletedWorkoutList";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import RecentExerciseList from "@/src/components/lists/RecentExerciseList";
import ActivityLoader from "@/src/components/ActivityLoader";
import { Button } from "@/src/components/ui/button";
import { db } from "@/src/db/client";

export default function Index() {
  const router = useRouter();
  const { selectedDate, setSelectedDate } = useDate();

  const { data: recentExercise, updatedAt: recentExerciseLoaded } =
    useLiveQuery(
      db
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

  const { data: todayWorkouts, updatedAt: workoutLoaded } = useLiveQuery(
    db.query.workouts.findMany({
      where: eq(workouts.date, selectedDate?.toISODate()!),
      with: {
        exercise: true,
        sets: true,
      },
    }),
    [selectedDate]
  );

  return (
    <SafeAreaWrapper>
      <View className="flex h-32">
        <DatePickerWithWeek
          currentDate={selectedDate!}
          onDateChange={setSelectedDate}
        />
      </View>
      <View className="flex-1">
        <View className="flex mt-2 mb-6">
          {!recentExerciseLoaded ? (
            <ActivityLoader />
          ) : (
            <>
              <Text className="text-xl font-semibold mt-4">
                Recent Exercise:
              </Text>
              <RecentExerciseList
                exercise={recentExercise}
                onPress={(id: number) => router.push(`/exercise/${id}`)}
              />
            </>
          )}
        </View>
        <View className="flex-1">
          <SearchBar
            placeholder={"Add exercise"}
            value={""}
            onPress={() => router.push("/search")}
          />
          {!workoutLoaded ? (
            <ActivityLoader />
          ) : (
            <>
              <Text className="text-xl font-semibold mt-4">
                Today's Workouts:
              </Text>
              <CompletedWorkoutList workouts={todayWorkouts} />
            </>
          )}
        </View>
      </View>
    </SafeAreaWrapper>
  );
}
