import { View } from "react-native";
import React, { useState } from "react";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import { useDate } from "@/src/context/DateContext";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  Calendar,
  CalendarList,
  Agenda,
  DateData,
} from "react-native-calendars";
import * as schema from "@/src//db/schema";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { desc, eq, like } from "drizzle-orm";
import ActivityLoader from "@/src/components/ActivityLoader";
import { CardDescription, CardTitle } from "@/src/components/ui/card";
import { User } from "@/src/lib/icons/User";
import SearchBar from "@/src/components/SearchBar";
import { useRouter } from "expo-router";
import RecentExerciseList from "@/src/components/lists/RecentExerciseList";
import { workouts, exercises } from "@/src/db/schema";

const Dashboard = () => {
  const { selectedDate, setSelectedDate } = useDate();
  const [selected, setSelected] = useState(selectedDate?.toISODate());
  const router = useRouter();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const dateSplit = selected?.split("-");
  const {
    data: routines,
    updatedAt: routinesLoaded,
    error: routineError,
  } = useLiveQuery(
    drizzleDb.query.routines.findMany({
      orderBy: (routines, { desc }) => [desc(routines.last_updated)],
      with: { routineExercises: true, routineSchedule: true },
    })
  );
  const {
    data: monthWorkouts,
    updatedAt: workoutLoaded,
    error: workoutError,
  } = useLiveQuery(
    drizzleDb.query.workouts.findMany({
      where: like(schema.workouts.date, `${dateSplit[0]}-${dateSplit[1]}-%%`),
      with: {
        exercise: true,
        sets: true,
      },
      orderBy: desc(schema.workouts.last_updated),
    }),
    [selected]
  );
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
  const workoutDates = monthWorkouts.map((x) => x.date);
  const markedDates: { [key: string]: any } = {};
  workoutDates.forEach(
    (x) =>
      (markedDates[x] = { marked: true, dotColor: "black", activeOpacity: 0 })
  );
  console.log(markedDates);
  return (
    <SafeAreaWrapper>
      {!routinesLoaded || !workoutLoaded ? (
        <ActivityLoader />
      ) : routineError || workoutError ? (
        <Text>Error</Text>
      ) : (
        <>
          {/* <Calendar
            onDayPress={(day: DateData) => {
              console.log(day);
              setSelected(day.dateString);
            }}
            markedDates={{
              ...markedDates,
              [selected]: {
                selected: true,
                disableTouchEvent: true,
                selectedColor: "black",
              },
            }}
          /> */}
          {/* <Text>{routines.length}</Text> */}
          {/* <Text>{monthWorkouts.length}</Text> */}
        </>
      )}
      <View className="flex-row items-end gap-x-4 mb-5">
        <Button
          className="rounded-full w-16 h-16"
          size={"icon"}
          variant={"secondary"}
        >
          <User className="color-primary" size={40} />
        </Button>
        <View className="mb-2">
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Ready to get fit</CardDescription>
        </View>
      </View>
      <SearchBar
        placeholder={"Search"}
        value={""}
        onPress={() => router.push("/search")}
      />
      <Text>Popular</Text>
      <Text>Recent</Text>
      <>
        <Text className="text-xl font-semibold mb-2">Recent Exercise:</Text>
        <RecentExerciseList
          exercise={recentExercise}
          horzontal={false}
          onPress={(id: number) => router.push(`/exercise/${id}`)}
        />
      </>
    </SafeAreaWrapper>
  );
};

export default Dashboard;
