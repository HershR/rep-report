import StyledSafeAreaView from '@/components/StyledSafeAreaView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/expo-sqlite/driver';

import { useLiveQuery } from 'drizzle-orm/expo-sqlite/query';
import { useSQLiteContext } from 'node_modules/expo-sqlite/build/hooks';
import React from 'react';
import { View } from 'react-native';
function Saved() {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const [tabValue, setTabValue] = React.useState('exercise');
  const {
    data: favoriteExercises,
    updatedAt: favoriteExercisesLoaded,
    error: favoriteExercisesError,
  } = useLiveQuery(
    drizzleDb.query.exercises.findMany({ where: eq(schema.exercises.is_favorite, true) }),
    []
  );
  const {
    data: savedRoutines,
    updatedAt: savedRoutinesLoaded,
    error: savedRoutinesError,
  } = useLiveQuery(drizzleDb.query.routines.findMany(), []);

  const renderExercises = () => {
    if (favoriteExercisesError) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text>Error loading exercises: {favoriteExercisesError.message}</Text>
        </View>
      );
    }
    if (!favoriteExercisesLoaded) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text>Loading exercises...</Text>
        </View>
      );
    }
    if (favoriteExercises.length === 0) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text>No saved exercises.</Text>
        </View>
      );
    }
    return favoriteExercises.map((exercise, index) => (
      <View key={index} className="bg-secondary rounded-lg p-4">
        <Text className="text-lg font-semibold">{exercise.name}</Text>
      </View>
    ));
  };

  const renderRoutines = () => {
    if (savedRoutinesError) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text>Error loading routines: {savedRoutinesError.message}</Text>
        </View>
      );
    }
    if (!savedRoutinesLoaded) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text>Loading routines...</Text>
        </View>
      );
    }
    if (savedRoutines.length === 0) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text>No saved routines.</Text>
        </View>
      );
    }
    return savedRoutines.map((routine, index) => (
      <View key={index} className="bg-secondary rounded-lg p-4">
        <Text className="text-lg font-semibold">{routine.name}</Text>
      </View>
    ));
  };

  return (
    <View className="flex-1">
      <StyledSafeAreaView className="flex-1 p-6 pb-2">
        <Tabs value={tabValue} onValueChange={setTabValue} className="flex-1">
          <TabsList>
            <TabsTrigger value="exercise" className="flex-1">
              <Text variant={'large'}>Exercise</Text>
            </TabsTrigger>
            <TabsTrigger value="routine" className="flex-1">
              <Text variant={'large'}>Routines</Text>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="exercise" className="flex-1">
            {renderExercises()}
          </TabsContent>
          <TabsContent value="routine" className="flex-1">
            {renderRoutines()}
          </TabsContent>
        </Tabs>
      </StyledSafeAreaView>
    </View>
  );
}

export default Saved;
