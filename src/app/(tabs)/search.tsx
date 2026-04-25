import ExerciseSearchComponent from '@/components/ExerciseSearchComponent';
import StyledSafeAreaView from '@/components/StyledSafeAreaView';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import React from 'react';
import { View } from 'react-native';
export default function Search() {
  const [value, setValue] = React.useState('exercise');
  const recentWorkouts = [1, 2, 3, 4, 5];

  return (
    <View className="flex-1">
      <StyledSafeAreaView className="relative flex-1 p-6 pb-2">
        <Tabs value={value} onValueChange={setValue} className="flex-1">
          <TabsList>
            <TabsTrigger value="exercise" className="flex-1">
              <Text variant={'large'} className="">
                Exercise
              </Text>
            </TabsTrigger>
            <TabsTrigger value="workout" className="flex-1">
              <Text variant={'large'}>Workouts</Text>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="exercise" className="flex-1 pt-3">
            <ExerciseSearchComponent />
          </TabsContent>
          <TabsContent value="workout"></TabsContent>
        </Tabs>
      </StyledSafeAreaView>
    </View>
  );
}
