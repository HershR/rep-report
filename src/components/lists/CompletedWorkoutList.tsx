import { View, FlatList, useWindowDimensions, Platform } from "react-native";
import React, { useEffect, useState } from "react";
import CompletedWorkout from "../CompletedWorkout";
interface Props {
  workouts: WorkoutWithExercise[];
  onUpdate?: (workout: WorkoutWithExercise) => void;
}
const CompletedWorkoutList = ({ workouts, onUpdate }: Props) => {
  const [numColumns, setNumColumns] = useState(1);
  const { width } = useWindowDimensions();
  const columnGap = 16;
  useEffect(() => {
    setNumColumns(width < 600 ? 1 : width < 1000 ? 2 : 3);
  }, [width]);

  function getItemWidth() {
    if (numColumns < 2) {
      return "";
    } else {
      const newWidth = Math.floor(
        width / numColumns - (columnGap * numColumns - 1)
      );
      return `max-w-[${newWidth}px]`;
    }
  }
  return (
    <FlatList
      key={numColumns}
      numColumns={numColumns}
      data={workouts}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
      columnWrapperStyle={
        numColumns > 1 ? { justifyContent: "flex-start", gap: columnGap } : null
      }
      ItemSeparatorComponent={() => <View style={{ height: columnGap }}></View>}
      renderItem={({ item }) => {
        return (
          <CompletedWorkout
            workout={item}
            containerClassname={getItemWidth()}
          />
        );
      }}
    />
  );
};

export default CompletedWorkoutList;
