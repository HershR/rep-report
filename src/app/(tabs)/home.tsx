import { DateTime } from "luxon";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { DateData, Direction } from "react-native-calendars/src/types";
import { CalendarProvider, ExpandableCalendar } from "react-native-calendars";
import { twMerge } from "tailwind-merge";
import SearchBar from "@/src/components/SearchBar";
import ActivityLoader from "@/src/components/ActivityLoader";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import CompletedWorkoutList from "@/src/components/lists/CompletedWorkoutList";
//db
import * as schema from "@/src/db/schema";
import { workouts } from "@/src/db/schema";
import { between, desc } from "drizzle-orm";
import { useSQLiteContext } from "expo-sqlite";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
//ui
import { Text } from "~/components/ui/text";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { Separator } from "@/src/components/ui/separator";
import { CalendarDays } from "@/src/lib/icons/CalendarDays";
import { ChevronRight } from "@/src/lib/icons/ChevronRight";

export default function Home() {
  const router = useRouter();
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const calendarRef = useRef<{ toggleCalendarPosition: () => boolean }>(null);
  const [selectedDate, setSelectedDate] = useState(DateTime.now());
  const [selectedMonth, setSelectedMonth] = useState(
    DateTime.now().toISODate()
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [daysWorkouts, setDaysWorkouts] = useState<WorkoutWithExercise[]>([]);
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  useDrizzleStudio(db);
  const { data: monthsWorkouts, updatedAt: workoutLoaded } = useLiveQuery(
    drizzleDb.query.workouts.findMany({
      where: between(
        workouts.date,
        selectedDate.startOf("month").toISODate(),
        selectedDate.endOf("month").toISODate()
      ),
      with: {
        exercise: true,
        sets: true,
      },
      orderBy: desc(workouts.last_updated),
    }),
    [selectedMonth]
  );
  useEffect(() => {
    if (monthsWorkouts) {
      setDaysWorkouts(
        monthsWorkouts.filter((x) => x.date === selectedDate.toISODate())
      );
    }
  }, [selectedDate, monthsWorkouts]);

  useEffect(() => {
    const splitDate = selectedMonth.split("-");
    const month = splitDate[1];
    const year = splitDate[0];
    if (
      parseInt(month) !== selectedDate.month ||
      parseInt(year) !== selectedDate.year
    ) {
      setSelectedMonth(selectedDate.toISODate());
    }
  }, [selectedDate]);

  const onDayPress = useCallback((day: DateData) => {
    // console.log("onDayPress", day);
    setSelectedDate(
      selectedDate.set({ day: day.day, month: day.month, year: day.year })
    );
  }, []);

  const toggleCalendarExpansion = useCallback(() => {
    calendarRef.current?.toggleCalendarPosition();
  }, []);

  const renderHeader = useCallback((date: Date) => {
    return (
      <TouchableOpacity
        className="flex-row justify-center items-center m-3 gap-x-4"
        onPress={toggleCalendarExpansion}
      >
        <Text className="text-2xl font-medium">
          {DateTime.fromISO(date.toISOString()).toFormat("LLL yyyy")}
        </Text>
        <CalendarDays className="color-primary" size={26} />
      </TouchableOpacity>
    );
  }, []);

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
    const dates = new Set(monthsWorkouts.map((x) => x.date));
    const markedDates: { [key: string]: any } = {};
    dates.forEach(
      (x) =>
        (markedDates[x] = {
          marked: true,
        })
    );

    return {
      ...markedDates,
      [selectedDate.toISODate()]: {
        selected: true,
        disableTouchEvent: true,
      },
    };
  }, [selectedDate, daysWorkouts]);

  const CALENDARTHEME = {
    backgroundColor: NAV_THEME[colorScheme].background,
    calendarBackground: NAV_THEME[colorScheme].background,
    selectedDayBackgroundColor: NAV_THEME[colorScheme].primary,
    selectedDayTextColor: NAV_THEME[colorScheme].border,
    dotColor: NAV_THEME[colorScheme].primary,
    arrowColor: NAV_THEME[colorScheme].primary,
    monthTextColor: NAV_THEME[colorScheme].text,
    textDisabledColor: NAV_THEME[colorScheme].border,
    dayTextColor: NAV_THEME[colorScheme].text,
    todayTextColor: NAV_THEME[colorScheme].text,
    todayDotColor: NAV_THEME[colorScheme].text,
    todayBackgroundColor: NAV_THEME[colorScheme].border,
  };
  return (
    <>
      <CalendarProvider
        date={selectedDate.toISODate()}
        onDateChanged={(date) => {
          const newDate = DateTime.fromFormat(date, "yyyy-MM-dd");
          //@ts-ignore
          setSelectedDate(newDate);
        }}
        onMonthChange={onDayPress}
      >
        <SafeAreaView
          edges={["top", "left", "right"]}
          onLayout={() => {
            setShowCalendar(true);
          }}
        >
          {showCalendar && (
            <ExpandableCalendar
              ref={calendarRef}
              key={colorScheme}
              theme={CALENDARTHEME}
              firstDay={1}
              renderHeader={renderHeader}
              renderArrow={renderArrow}
              current={selectedDate.toISODate()}
              markedDates={marked}
              onDayPress={onDayPress}
              allowShadow={false}
              enableSwipeMonths={false}
              closeOnDayPress={false}
              hideKnob
              disablePan
              disableWeekScroll
              disableArrowLeft={false}
              disableArrowRight={false}
              disableAllTouchEventsForDisabledDays
            />
          )}
        </SafeAreaView>

        <Separator className="mt-2 mb-4" />
        <SafeAreaWrapper hasTabBar hasHeader viewStyle="mt-0">
          {!workoutLoaded ? (
            <ActivityLoader />
          ) : (
            <View className="flex-1 gap-y-2">
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
                  <CompletedWorkoutList workouts={daysWorkouts} />
                </>
              )}
            </View>
          )}
        </SafeAreaWrapper>
      </CalendarProvider>
    </>
  );
}
