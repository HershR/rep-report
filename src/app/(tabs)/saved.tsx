import StyledSafeAreaView from '@/components/StyledSafeAreaView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import React from 'react';
import { View } from 'react-native';
function Saved() {
  const [tabValue, setTabValue] = React.useState('exercise');
  const [savedExercises, setSavedExercises] = React.useState([]);
  const [savedWorkouts, setSavedWorkouts] = React.useState([]);
  return (
    <View className="flex-1">
      <StyledSafeAreaView className="flex-1 p-6 pb-2">
        <Tabs value={tabValue} onValueChange={setTabValue} className="flex-1">
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
          <TabsContent value="exercise" className="flex-1 gap-y-4">
            {savedExercises.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <Text variant={'large'} className="text-muted-foreground text-center">
                  No saved exercises yet.
                </Text>
              </View>
            ) : (
              savedExercises.map((exercise, index) => (
                <View key={index} className="bg-secondary rounded-lg p-4">
                  <Text className="text-lg font-semibold">{exercise.name}</Text>
                  <Text className="text-muted-foreground text-sm">{exercise.description}</Text>
                </View>
              ))
            )}
          </TabsContent>
          <TabsContent value="workout">
            {savedWorkouts.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <Text variant={'large'} className="text-muted-foreground text-center">
                  No saved workouts yet.
                </Text>
              </View>
            ) : (
              savedWorkouts.map((workout, index) => (
                <View key={index} className="bg-secondary rounded-lg p-4">
                  <Text className="text-lg font-semibold">{workout.name}</Text>
                  <Text className="text-muted-foreground text-sm">{workout.description}</Text>
                </View>
              ))
            )}
          </TabsContent>
        </Tabs>
      </StyledSafeAreaView>
    </View>
  );
}

export default Saved;
