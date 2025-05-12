import { FlatList, View } from "react-native";
import React from "react";
import { Text } from "../ui/text";
import ExerciseCard from "../ExerciseCard";

interface Props {
  exercise: Omit<Exercise, "is_favorite">[];
  onPress: (id: number) => void;
}

const RecentExerciseList = ({ exercise: recentExercise, onPress }: Props) => {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={recentExercise}
      keyExtractor={(item) => item.id!.toString()}
      contentContainerStyle={{ gap: 5 }}
      renderItem={({ item }) => {
        return (
          <ExerciseCard
            exercise={{
              id: item.id!,
              name: item.name!,
              category: item.category!,
              image: item.image || null,
            }}
            containerClassname="aspect-square h-40 md:h-52"
          />
        );
      }}
      ItemSeparatorComponent={() => <View className="w-4" />}
      initialNumToRender={5}
    ></FlatList>
  );
};

export default RecentExerciseList;
