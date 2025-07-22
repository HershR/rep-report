import { FlatList, View } from "react-native";
import React from "react";
import { Text } from "../ui/text";
import ExerciseCard from "../ExerciseCard";
import Animated, { FadeIn } from "react-native-reanimated";

interface Props {
  exercise: Omit<Exercise, "is_favorite">[];
  onPress: (id: number) => void;
  horzontal?: boolean;
}

const RecentExerciseList = ({
  exercise: recentExercise,
  onPress,
  horzontal = true,
}: Props) => {
  return (
    <FlatList
      horizontal={horzontal}
      showsHorizontalScrollIndicator={false}
      data={recentExercise}
      keyExtractor={(item) => item.id!.toString()}
      contentContainerStyle={{ gap: 5 }}
      renderItem={({ item }) => {
        return (
          <Animated.View entering={FadeIn.duration(600)} className="flex-1">
            <ExerciseCard
              exercise={{
                id: item.id!,
                name: item.name!,
                category: item.category!,
                image: item.image || null,
              }}
              containerClassname={
                horzontal ? "aspect-square h-40 md:h-52" : "h-40 md:h-52 w-full"
              }
            />
          </Animated.View>
        );
      }}
      ItemSeparatorComponent={() => <View className="w-4" />}
      initialNumToRender={5}
    ></FlatList>
  );
};

export default RecentExerciseList;
