import CustomExpandableCalendar from '@/components/CustomExpandableCalendar';
import StyledImage from '@/components/StyledImage';
import StyledSafeAreaView from '@/components/StyledSafeAreaView';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useDate } from '@/hooks/useDate';
import { FlashList } from '@shopify/flash-list';
import { Clock } from 'lucide-react-native';
import { useEffect } from 'react';
import { View } from 'react-native';

export default function Dashboard() {
  const recentWorkouts = [1, 2, 3, 4, 5];
  const dateContext = useDate();
  const { currentDate, updateDate } = dateContext!;
  useEffect(() => {
    console.log('Current date in Dashboard:', currentDate);
  }, [currentDate]);
  return (
    <View className="flex-1">
      <StyledSafeAreaView className="flex-1" edges={['top']}>
        <CustomExpandableCalendar weekView={false}>
          <View className="flex-1 px-6 py-4">
            <Text className="mb-4 text-xl font-bold">Exercises</Text>
            {recentWorkouts.length === 0 && (
              <Text className="text-muted-foreground text-center text-sm">No recent workouts</Text>
            )}
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
          </View>
        </CustomExpandableCalendar>
      </StyledSafeAreaView>
    </View>
  );
}
