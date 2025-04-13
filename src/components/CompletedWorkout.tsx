import { View, Image } from "react-native";
import React from "react";
import { Button } from "./ui/button";
import { toUpperCase } from "../services/textFormatter";
import ExerciseImage from "./ExerciseImage";
import { Text } from "./ui/text";
interface Props {
  workout: WorkoutWithExercise;
  onUpdate: () => void;
  onDelete: () => void;
}

const CompletedWorkout = ({ workout, onUpdate, onDelete }: Props) => {
  const image = workout.exercise.image;
  return (
    <View className="flex flex-row w-full justify-between items-center">
      <ExerciseImage
        image_uri={image}
        imageClassname={"w-20 h-20 rounded-md bg-white"}
        textClassname={"text-black text-center"}
      ></ExerciseImage>
      <View className="flex-1 mx-4">
        <Text className="flex text-left text-lg font-semibold">
          {toUpperCase(workout.exercise.name)}{" "}
          <Text>({workout.exercise.category})</Text>
        </Text>
        <Text className="text-muted-foreground">
          Sets: {workout.sets.length}
        </Text>
      </View>
      <Button onPress={onUpdate}>
        <Text>Update</Text>
      </Button>
    </View>
  );
};

export default CompletedWorkout;
