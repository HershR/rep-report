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
  Calendar,
  CalendarProvider,
  ExpandableCalendar,
  WeekCalendar,
} from "react-native-calendars";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  DateData,
  Direction,
  MarkedDates,
} from "react-native-calendars/src/types";
import { CalendarDays } from "@/src/lib/icons/CalendarDays";
import DatePickerWithWeek from "@/src/components/datepicker/DatePickerWithWeek";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  SlideInUp,
  SlideOutUp,
  StretchInY,
  StretchOutY,
} from "react-native-reanimated";
import { ChevronRight } from "@/src/lib/icons/ChevronRight";
import { twMerge } from "tailwind-merge";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Home() {
  const router = useRouter();
  const calendarRef = useRef<{ toggleCalendarPosition: () => boolean }>(null);
  const [selectedDate, setSelectedDate] = useState(DateTime.now());
  const [weekView, setWeekView] = useState(true);
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  useDrizzleStudio(db);

  const { data: todayWorkouts, updatedAt: workoutLoaded } = useLiveQuery(
    drizzleDb.query.workouts.findMany({
      where: eq(workouts.date, selectedDate?.toISODate()!),
      with: {
        exercise: true,
        sets: true,
      },
      orderBy: desc(workouts.last_updated),
    }),
    [selectedDate]
  );
  const onDayPress = useCallback((day: DateData) => {
    setSelectedDate(
      selectedDate.set({ day: day.day, month: day.month, year: day.year })
    );
  }, []);

  const toggleCalendarExpansion = useCallback(() => {
    calendarRef.current?.toggleCalendarPosition();
  }, []);

  const renderHeader = (date: Date) => {
    return (
      <TouchableOpacity
        className="flex-row justify-center items-center m-3 gap-x-4"
        onPress={toggleCalendarExpansion}
      >
        <Text className="text-2xl">
          {DateTime.fromISO(date.toISOString()).toFormat("LLL yyyy")}
        </Text>
        <CalendarDays className="color-primary" size={26} />
      </TouchableOpacity>
    );
  };

  const renderArrow = (direction: Direction) => {
    return (
      <ChevronRight
        className={twMerge(
          "color-primary",
          direction === "left" ? "rotate-180" : ""
        )}
        size={24}
      />
    );
  };
  const marked = useMemo(() => {
    return {
      [selectedDate.toISODate()]: {
        selected: true,
        disableTouchEvent: true,
        selectedColor: "orange",
        selectedTextColor: "red",
      },
    };
  }, [selectedDate]);
  return (
    <>
      <CalendarProvider date={selectedDate.toISODate()}>
        <SafeAreaView>
          <ExpandableCalendar
            ref={calendarRef}
            renderHeader={renderHeader}
            renderArrow={renderArrow}
            // current={selectedDate.toISODate()}
            disableArrowLeft={false}
            disableArrowRight={false}
            markedDates={marked}
            onDayPress={onDayPress}
            allowShadow={false}
            enableSwipeMonths={false}
            closeOnDayPress={false}
            hideKnob
            disableWeekScroll
            disablePan
            disableAllTouchEventsForDisabledDays
          />
        </SafeAreaView>
        <Separator className="my-4" />

        <SafeAreaWrapper>
          {/* <View className="h-32">
        <DatePickerWithWeek
          currentDate={selectedDate!}
          onDateChange={setSelectedDate}
        />
      </View> */}
          {/* {weekView ? (
          <
            // Animated.View
            // entering={SlideInUp.duration(600)}
            // exiting={FadeOutDown.duration(600)}
          >
            {renderHeader(selectedDate.toJSDate())}
            <WeekCalendar
              current={selectedDate.toISODate()}
              disableArrowLeft={false}
              disableArrowRight={false}
              markedDates={marked}
              onDayPress={onDayPress}
              allowShadow={false}
              enableSwipeMonths={false}
            />
          </
            // Animated.View
          >
        ) : (
          <Animated.View
            entering={StretchInY.duration(200)}
            exiting={StretchOutY.duration(50)}
          >
            <Calendar
              current={selectedDate.toISODate()}
              markedDates={marked}
              onDayPress={onDayPress}
              renderHeader={renderHeader}
            />
          </Animated.View>
        )} */}

          {!workoutLoaded ? (
            <ActivityLoader />
          ) : (
            <View className="flex-1">
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
                      {selectedDate?.toISODate() === DateTime.now().toISODate()
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
        </SafeAreaWrapper>
      </CalendarProvider>
    </>
  );
}
