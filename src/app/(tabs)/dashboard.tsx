import CustomExpandableCalendar from '@/components/CustomExpandableCalendar';
import StyledImage from '@/components/StyledImage';
import StyledSafeAreaView from '@/components/StyledSafeAreaView';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import * as schema from '@/db/schema';
import { useDate } from '@/hooks/useDate';
import { formatDateString } from '@/lib/dateUtils';
import { FlashList } from '@shopify/flash-list';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite/driver';
import { eq } from 'drizzle-orm/sql/expressions/conditions';
import { Clock } from 'lucide-react-native';
import { useSQLiteContext } from 'node_modules/expo-sqlite/build/hooks';
import { View } from 'react-native';
export default function Dashboard() {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const dateContext = useDate();
  const { currentDate, currentLocalDate, updateDate } = dateContext!;

  const {
    data: todaysWorkouts,
    updatedAt: todaysWorkoutsLoaded,
    error: todaysWorkoutsError,
  } = useLiveQuery(
    drizzleDb.query.workouts.findMany({
      where: eq(schema.workouts.date, currentLocalDate),
    }),
    [currentDate]
  );
  const renderWorkouts = () => {
    if (todaysWorkoutsError) {
      return <Text>Error loading workouts: {todaysWorkoutsError.message}</Text>;
    }
    if (!todaysWorkoutsLoaded) {
      return <Text>Loading workouts...</Text>;
    }
    if (todaysWorkouts.length === 0) {
      return <Text>No workouts for {formatDateString(currentLocalDate, 'MMMM DD YYYY')}</Text>;
    }
    return (
      <FlashList
        data={todaysWorkouts}
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
  return (
    <View className="flex-1">
      <StyledSafeAreaView className="flex-1" edges={['top']}>
        <CustomExpandableCalendar weekView={false}>
          <View className="flex-1 px-6 py-4">
            <Text className="mb-4 text-xl font-bold">Workouts</Text>
            {renderWorkouts()}
          </View>
        </CustomExpandableCalendar>
      </StyledSafeAreaView>
    </View>
  );
}
