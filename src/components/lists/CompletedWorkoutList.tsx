import { View, FlatList } from "react-native";
import React from "react";
import CompletedWorkout from "../CompletedWorkout";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import { formatList } from "@/src/utils/listFormatter";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

interface Props {
  workouts: WorkoutWithExercise[];
  onUpdate?: (workout: WorkoutWithExercise) => void;
}
const CompletedWorkoutList = ({ workouts, onUpdate }: Props) => {
  const { width } = useSafeAreaFrame();

  const numColumns = width < 600 ? 1 : width < 1000 ? 2 : 3;

  return (
    <FlatList
      key={numColumns}
      numColumns={numColumns}
      data={formatList(workouts, numColumns)}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      columnWrapperClassName={numColumns > 1 ? "justify-start gap-x-4" : ""}
      ItemSeparatorComponent={() => <View className="h-4"></View>}
      renderItem={({ item }) => {
        if (item.empty) {
          return <View className="flex-1 h-32 p-4"></View>;
        }
        return (
          <Animated.View entering={FadeIn.duration(600)} className="flex-1">
            <CompletedWorkout workout={item} />
          </Animated.View>
        );
      }}
    />
  );
};

export default CompletedWorkoutList;
