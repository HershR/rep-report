import { ActivityIndicator, FlatList, Text, View } from "react-native";
import DatePickerWithWeek from "@/src/components/datepicker/DatePickerWithWeek";
import { DateTime } from "luxon";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import useFetch from "@/src/services/useFetch";
import RecentExerciseCard from "@/src/components/RecentExerciseCard";
import SearchBar from "@/src/components/SearchBar";
import { useRouter } from "expo-router";
import { useDate } from "@/src/context/DateContext";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/src//db/schema";
import { getRecentWorkouts, getWorkoutsByDate } from "@/src/db/dbHelpers";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";

export default function Index() {
  const router = useRouter();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  useDrizzleStudio(db);

  const { selectedDate, setSelectedDate } = useDate();

  const {
    data: recentExercise,
    loading: recentExerciseLoading,
    error: recentExerciseError,
  } = useFetch(() => getRecentWorkouts(drizzleDb, 10));
  const {
    data: todayExercises,
    loading: todayExerciseLoading,
    error: todayExerciseError,
    refetch: refetchToday,
  } = useFetch(() => getWorkoutsByDate(drizzleDb, selectedDate!.toISODate()!));

  function updateDate(newDate: DateTime) {
    if (!!newDate) {
      setSelectedDate(newDate);
    }
  }
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      await refetchToday();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedDate]);
  return (
    <View className="flex-1 bg-secondary">
      <SafeAreaView className="flex-1 mx-8 my-10">
        <View className="flex">
          <DatePickerWithWeek
            currentDate={selectedDate!}
            onDateChange={updateDate}
          />
        </View>
        {recentExerciseLoading ? (
          <ActivityIndicator
            size={"large"}
            className="mt-10 self-center"
          ></ActivityIndicator>
        ) : (
          <View className="flex-1">
            <View className="flex">
              {recentExercise ? (
                <>
                  <Text className="text-primary text-lg font-bold">
                    Recent Exercise
                  </Text>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-4 mt-3"
                    data={recentExercise}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ gap: 26 }}
                    renderItem={({ item, index }) => {
                      return (
                        <RecentExerciseCard
                          id={item.exercise.id}
                          wger_id={item.exercise.wger_id!}
                          name={item.exercise.name}
                          category={item.exercise.category}
                          image={item.exercise.image!}
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
              {todayExerciseLoading ? (
                <ActivityIndicator
                  size={"large"}
                  className="mt-10 self-center"
                />
              ) : (
                <>
                  <Text className="text-primary text-lg font-bold mt-4">
                    Today's Workouts
                  </Text>
                </>
              )}
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
