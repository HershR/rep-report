import { TouchableOpacity, View } from "react-native";
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
import ActivityLoader from "@/src/components/ActivityLoader";
import { DateTime } from "luxon";
import { Separator } from "@/src/components/ui/separator";
import {
  CalendarProvider,
  ExpandableCalendar,
  WeekCalendar,
} from "react-native-calendars";
import { useCallback, useRef, useState } from "react";
import { MarkedDates } from "react-native-calendars/src/types";
import { CalendarDays } from "@/src/lib/icons/CalendarDays";
export default function Home() {
  const router = useRouter();

  const { selectedDate, setSelectedDate } = useDate();
  const [currentDate, setCurrentDate] = useState(DateTime.now());
  const calendarRef = useRef<{ toggleCalendarPosition: () => boolean }>(null);
  const [weekView, setWeekView] = useState<boolean>(false);
  const [marked, setMarked] = useState<MarkedDates>({});

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  useDrizzleStudio(db);
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
      where: eq(workouts.date, currentDate?.toISODate()!),
      with: {
        exercise: true,
        sets: true,
      },
      orderBy: desc(workouts.last_updated),
    }),
    [currentDate]
  );
  const toggleCalendarExpansion = useCallback(() => {
    calendarRef.current?.toggleCalendarPosition();
  }, []);

  const renderHeader = useCallback(
    (date: Date) => {
      return (
        <TouchableOpacity
          className="flex-row justify-center items-center m-3 gap-x-4"
          onPress={toggleCalendarExpansion}
        >
          <Text className="text-xl">
            {DateTime.fromISO(date.toISOString()).toFormat("LLL yyyy")}
          </Text>
          <CalendarDays className="color-primary" size={26} />
        </TouchableOpacity>
      );
    },
    [toggleCalendarExpansion]
  );

  return (
    <SafeAreaWrapper>
      {/* <View className="h-32">
        <DatePickerWithWeek
        currentDate={selectedDate!}
        onDateChange={setSelectedDate}
        />
        </View> */}
      <CalendarProvider
        date={new Date().toISOString().slice(0, 10)}
        // onDateChanged={(date)=>{

        // }}
        // onMonthChange={onMonthChange}
        // showTodayButton
        // disabledOpacity={0.6}
        // theme={todayBtnTheme.current}
        // todayBottomMargin={16}
        // disableAutoDaySelection={[ExpandableCalendar.navigationTypes.MONTH_SCROLL, ExpandableCalendar.navigationTypes.MONTH_ARROWS]}
      >
        {weekView ? (
          <WeekCalendar firstDay={1} markedDates={marked} />
        ) : (
          <ExpandableCalendar
            renderHeader={renderHeader}
            ref={calendarRef}
            onDayPress={(day) => {
              setCurrentDate(
                currentDate?.set({
                  year: day.year,
                  month: day.month,
                  day: day.day,
                })
              );
            }}
            allowShadow={false}
            hideKnob
            disableWeekScroll
            disableAllTouchEventsForDisabledDays
            firstDay={1}
            markedDates={marked}
            closeOnDayPress={false}
          />
        )}
        <Separator className="my-4" />
        {!recentExerciseLoaded || !workoutLoaded ? (
          <ActivityLoader />
        ) : (
          <View className="flex-1">
            {/* <View className="flex">
            {recentExercise ? (
              <>
                <Text className="text-xl font-semibold mb-2">
                  Recent Exercise:
                </Text>
                <RecentExerciseList
                  exercise={recentExercise}
                  onPress={(id: number) => router.push(`/exercise/${id}`)}
                />
              </>
            ) : null}
          </View>
          <Separator className="my-4" /> */}

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
                  <Text className="text-xl font-semibold mt-2 mb-2">
                    {currentDate?.toISODate() === DateTime.now().toISODate()
                      ? "Today's Workouts"
                      : selectedDate?.toFormat("LLL dd, yyyy")}
                    :
                  </Text>
                  <CompletedWorkoutList workouts={todayWorkouts} />
                </>
              )}
            </View>
          </View>
        )}
      </CalendarProvider>
    </SafeAreaWrapper>
  );
}
