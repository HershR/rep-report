import { ActivityIndicator, FlatList, View } from "react-native";
import DatePickerWithWeek from "@/src/components/datepicker/DatePickerWithWeek";
import { SafeAreaView } from "react-native-safe-area-context";
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
import ExerciseCard from "@/src/components/ExerciseCard";
import CompletedWorkoutList from "@/src/components/CompletedWorkoutList";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import RecentExerciseList from "@/src/components/RecentExerciseList";
export default function Index() {
  const router = useRouter();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  useDrizzleStudio(db);

  const { selectedDate, setSelectedDate } = useDate();

  const { data: recentExercise, updatedAt: recentExerciseLoaded } =
    useLiveQuery(
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

  const { data: todayWorkouts, updatedAt: workoutLoaded } = useLiveQuery(
    drizzleDb.query.workouts.findMany({
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
      {!recentExerciseLoaded || !workoutLoaded ? (
        <ActivityIndicator
          size={"large"}
          className="mt-10 self-center"
        ></ActivityIndicator>
      ) : (
        <View className="flex-1">
          <View className="flex mt-6 mb-6 gap-y-2">
            {recentExercise ? (
              <>
                <Text className="text-xl font-semibold mt-4">
                  Recent Exercise:
                </Text>
                <RecentExerciseList
                  exercise={recentExercise}
                  onPress={(id: number) => router.push(`/exercise/${id}`)}
                />
              </>
            ) : null}
          </View>
          <View className="flex-1">
            <SearchBar
              placeholder={"Add exercise"}
              value={""}
              onPress={() => router.push("/search")}
            />
            {!workoutLoaded ? (
              <ActivityIndicator size={"large"} className="mt-10 self-center" />
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
      )}
    </SafeAreaWrapper>
  );
}
