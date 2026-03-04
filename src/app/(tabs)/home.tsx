import StyledImage from '@/components/StyledImage';
import StyledSafeAreaView from '@/components/StyledSafeAreaView';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { FlashList } from '@shopify/flash-list';
import { Clock, Play, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { ScrollView, View } from 'react-native';

export default function Home() {
  const weeklyWorkouts = [1, 2, 3];
  const totalMinutes = 40;
  const recentWorkouts = [1, 2, 3, 4, 5];
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
                <Text className="text-2xl font-bold text-gray-900">{weeklyWorkouts.length}</Text>
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
                <Text className="text-xl font-bold text-white">Morning Cardio</Text>
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
          </View>
          {/* Featured and Recent Workouts */}
          <View>
            <Text className="mb-4 text-xl font-bold">Recent Workouts</Text>
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
        </ScrollView>
      </StyledSafeAreaView>
    </View>
  );
}
