import StyledImage from '@/components/StyledImage';
import StyledSafeAreaView from '@/components/StyledSafeAreaView';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import * as schema from '@/db/schema';
import { routineSchedule, workouts } from '@/db/schema';
import { FlashList } from '@shopify/flash-list';
import { between, desc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/expo-sqlite/driver';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite/query';
import { Clock, Play, TrendingUp } from 'lucide-react-native';
import { useSQLiteContext } from 'node_modules/expo-sqlite/build/hooks';
import React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
function getWeekRangeMondayStart(date = new Date()) {
  const currentDay = date.getDay();
  // Calculate the number of days to subtract to get to Monday.
  // If today is Sunday (0), subtract 6 days. Otherwise, subtract currentDay - 1.
  const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;

  // Get the date of Monday
  const monday = new Date(date);
  monday.setDate(date.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0); // Set time to midnight for the start of the day

  // Get the date of Sunday (Monday + 6 days)
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999); // Set time to just before midnight for the end of the day

  return {
    monday: monday,
    sunday: sunday,
  };
}
export default function Home() {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const [weekStart, weekEnd] = React.useMemo(() => {
    const { monday, sunday } = getWeekRangeMondayStart();
    return [monday.toISOString().split('T')[0], sunday.toISOString().split('T')[0]];
  }, []);
  const totalMinutes = 40;
  const {
    data: recentWorkouts,
    updatedAt: workoutsLoaded,
    error: workoutsError,
  } = useLiveQuery(
    drizzleDb.query.workouts.findMany({
      orderBy: desc(workouts.last_updated),
      where: between(workouts.date, weekStart, weekEnd),
    }),
    []
  );
  const {
    data: scheduledRoutine,
    updatedAt: scheduledRoutineLoaded,
    error: scheduledRoutineError,
  } = useLiveQuery(
    drizzleDb.query.routineSchedule.findFirst({
      where: eq(routineSchedule.day, new Date().getDay()),
      with: {
        routine: {},
      },
    }),
    []
  );
  const renderWorkouts = () => {
    if (!workoutsLoaded) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      );
    }
    if (workoutsError) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text className="text-center text-sm text-red-500">
            Error loading workouts: {workoutsError.message}
          </Text>
        </View>
      );
    }
    if (recentWorkouts.length === 0) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground text-center text-sm">No recent workouts</Text>
        </View>
      );
    }
    return (
      <FlashList
        data={recentWorkouts}
        renderItem={({ item, index }) => (
          <View
            key={index}
            className="mb-4 flex flex-row items-center gap-4 rounded-2xl bg-gray-100 p-4 dark:bg-gray-700">
            <StyledImage
              source={{
                uri: 'https://picsum.photos/200/200?random=' + index,
              }}
              alt="Workout Thumbnail"
              className="h-16 w-16 rounded-lg"
              contentFit="cover"
            />
            <View>
              <Text className="font-medium">Evening Yoga</Text>
              <View className="mt-1 flex flex-row items-center gap-2 text-xs">
                <Icon className="text-gray-500" as={Clock} size={12} />
                <Text>45 min</Text>
                <Text>•</Text>
                <Text>Beginner</Text>
              </View>
            </View>
          </View>
        )}
      />
    );
  };
  const renderScheduledRoutine = () => {
    if (!scheduledRoutineLoaded) {
      return <ActivityIndicator size="large" />;
    }
    if (scheduledRoutineError) {
      return (
        <Text className="text-center text-sm text-red-500">
          Error loading scheduled routine: {scheduledRoutineError.message}
        </Text>
      );
    }
    if (!scheduledRoutine) {
      return (
        <Text className="text-muted-foreground text-center text-sm">
          No routine scheduled for today
        </Text>
      );
    }
    return (
      <View className="group relative h-48 cursor-pointer overflow-hidden rounded-3xl shadow-lg">
        <StyledImage
          source={{
            uri: 'https://fastly.picsum.photos/id/539/400/200.jpg?hmac=wQJ0BYlehncMJgnnAIN4NXXyq1BShgIQMSUS37rfTEU',
          }}
          alt="Running"
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          contentFit="cover"
          transition={1000}
        />
        <View className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-gray-800 to-transparent p-6">
          <Text className="text-xl font-bold text-white">{scheduledRoutine.routine.name}</Text>
          <View className="mt-1 flex flex-row items-center gap-2 text-sm text-white">
            <Icon className="text-gray-500" as={Clock} size={14} />
            <Text className="text-white">30 min</Text>
            <Text className="text-white">•</Text>
            <Text className="text-white">Intermediate</Text>
          </View>
        </View>
        <Button className="text-primary bg-background absolute right-6 bottom-6 rounded-full p-3">
          <Icon as={Play} size={20} />
        </Button>
      </View>
    );
  };
  return (
    <View className="flex-1">
      <StyledSafeAreaView className="flex-1 p-6 pb-2">
        <View>
          <Text className="text-primary text-3xl font-bold sm:text-lg lg:text-xl">Hello, User</Text>
          <Text className="text-muted-foreground mt-1">Ready for your next Workout!</Text>
        </View>
        {/* Stats Cards */}
        <ScrollView
          className="flex-1"
          contentContainerClassName="w-full justify-center gap-y-4 mt-4"
          showsVerticalScrollIndicator={false}>
          <View className="flex flex-row items-center justify-center gap-4 px-2">
            <View className="w-1/2 gap-2 rounded-2xl bg-blue-50 p-4">
              <View className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Icon className="text-blue-600" as={TrendingUp} size={20} />
              </View>
              <View>
                <Text className="text-2xl font-bold text-gray-900">{recentWorkouts.length}</Text>
                <Text className="text-xs font-medium text-gray-500">Workouts this week</Text>
              </View>
            </View>
            <View className="w-1/2 gap-2 rounded-2xl bg-orange-50 p-4">
              <View className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <Icon className="text-orange-600" as={Clock} size={20} />
              </View>
              <View>
                <Text className="text-2xl font-bold text-gray-900">{Math.round(totalMinutes)}</Text>
                <Text className="text-xs font-medium text-gray-500">Minutes active</Text>
              </View>
            </View>
          </View>
          {/* Featured / CTA */}
          <View>
            <Text className="mb-4 text-xl font-bold">Daily Pick</Text>
            {renderScheduledRoutine()}
          </View>
          {/* Featured and Recent Workouts */}
          <View>
            <Text className="mb-4 text-xl font-bold">Recent Workouts</Text>
            {renderWorkouts()}
          </View>
        </ScrollView>
      </StyledSafeAreaView>
    </View>
  );
}
