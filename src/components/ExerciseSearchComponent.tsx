import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { FlashList } from '@shopify/flash-list';
import { LucideIcon, Search as SI } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import StyledImage from './StyledImage';

function ExerciseSearchComponent() {
  const exercise = [1, 2, 3, 4, 5];
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <>
      <View className="border-border flex-row items-center gap-2 rounded-lg border-2 px-4 py-2">
        <Icon as={SI as LucideIcon} className="text-muted-foreground" size={20} />
        <Input
          placeholder="Search Exercises"
          className="text-muted-foreground flex-1 border-0 bg-transparent shadow-none"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      {exercise.length === 0 && (
        <Text className="text-muted-foreground text-lg">No Exercise Found</Text>
      )}
      <FlashList
        data={exercise}
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
            </View>
          </View>
        )}
      />
    </>
  );
}

export default ExerciseSearchComponent;
