import { wgerCategories } from '@/constants/excerciseCategory';
import { ExerciseInfo } from '@/types/WgerApiTypes';
import { router } from 'expo-router';
import { ChevronRight, Image, LucideIcon } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import StyledImage from './StyledImage';
import { Icon } from './ui/icon';
import { Text } from './ui/text';
function ExerciseCard({ id, translations, images, category, muscles, equipment }: ExerciseInfo) {
  const name = translations.find((x) => x.language === 2)?.name || 'Unknown Exercise';

  return (
    <TouchableOpacity
      className="bg-background border-border flex flex-row items-center gap-4 rounded-2xl border p-3"
      onPress={() => router.push(`./exercise/${id}`)}>
      <View className="h-24 w-24 items-center justify-center rounded-2xl bg-gray-200">
        {images.length > 0 ? (
          <StyledImage
            source={{ uri: images[0].image }}
            alt={name}
            className="h-full w-full rounded-2xl"
            contentFit="cover"
          />
        ) : (
          <Icon as={Image as LucideIcon} size={30} className="text-muted-foreground" />
        )}
      </View>
      <View className="flex-1 py-4">
        <Text variant={'h4'}>{name}</Text>
        <Text variant={'p'} className="mt-0">
          {wgerCategories.get(category.id) || 'Unknown Category'}
        </Text>
      </View>
      <View className="justify-center">
        <Icon as={ChevronRight} size={40} className="text-muted-foreground" />
      </View>
    </TouchableOpacity>
  );
}
export default ExerciseCard;
