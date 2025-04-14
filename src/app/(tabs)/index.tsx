import { ActivityIndicator, FlatList, View } from "react-native";
import DatePickerWithWeek from "@/src/components/datepicker/DatePickerWithWeek";
import { SafeAreaView } from "react-native-safe-area-context";
import RecentExerciseCard from "@/src/components/RecentExerciseCard";
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
import CompletedWorkout from "@/src/components/CompletedWorkout";

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
          exercise_id: workouts.exercise_id,
          exercise_wger_id: exercises.wger_id,
          exercise_name: exercises.name,
          exercise_image: exercises.image,
          exercise_category: exercises.category,
        })
        .from(workouts)
        .innerJoin(exercises, eq(workouts.exercise_id, exercises.id))
        .orderBy(desc(workouts.updated_date), desc(workouts.date))
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
  function goToWorkout(workout: WorkoutWithExercise): void {
    return router.push({
      pathname: "../workout/[id]",
      params: {
        id: workout.id,
        exerciseId: workout.exercise_id,
        exerciseName: workout.exercise.name,
        exerciseURI: workout.exercise.image,
      },
    });
  }
  return (
    <View className="flex-1 bg-secondary">
      <SafeAreaView className="flex-1 mx-8 mt-10 pb-20">
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
                  <Text className="text-xl font-semibold">
                    Recent Exercise:
                  </Text>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={recentExercise}
                    keyExtractor={(item) => item.exercise_id!.toString()}
                    contentContainerStyle={{ gap: 5 }}
                    renderItem={({ item }) => {
                      return (
                        <RecentExerciseCard
                          id={item.exercise_id}
                          wger_id={item.exercise_wger_id!}
                          name={item.exercise_name}
                          category={item.exercise_category}
                          image={item.exercise_image!}
                        />
                      );
                    }}
                    ItemSeparatorComponent={() => <View className="w-4" />}
                    initialNumToRender={5}
                  ></FlatList>
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
                <ActivityIndicator
                  size={"large"}
                  className="mt-10 self-center"
                />
              ) : (
                <>
                  <Text className="text-xl font-semibold my-4">
                    Today's Workouts
                  </Text>
                  <FlatList
                    data={todayWorkouts}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.id.toString()}
                    ItemSeparatorComponent={() => <View className="h-4"></View>}
                    renderItem={({ item }) => {
                      return (
                        <CompletedWorkout
                          workout={item}
                          onUpdate={() => goToWorkout(item)}
                          onDelete={() => {}}
                        />
                      );
                    }}
                  ></FlatList>
                </>
              )}
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
