import { View, Image, TouchableOpacity } from "react-native";
import React from "react";
import { Button } from "./ui/button";
import { toUpperCase } from "../services/textFormatter";
import ExerciseImage from "./ExerciseImage";
import { Text } from "./ui/text";
import { Card, CardContent } from "./ui/card";
import { Link } from "expo-router";
import ExerciseCard from "./ExerciseCard";
interface Props {
  workout: WorkoutWithExercise;
  onUpdate: () => void;
  onDelete: () => void;
}

const CompletedWorkout = ({ workout, onUpdate, onDelete }: Props) => {
  const image = workout.exercise.image;
  return (
    <Card className="flex-1 justify-center items-center p-4">
      <View className="flex-row w-full h-full justify-center items-center">
        <Link href={`/exercise/${workout.exercise.id}`} asChild>
          <TouchableOpacity>
            <ExerciseImage
              image_uri={image}
              containerClassname="w-20 h-20 justify-center items-center"
            ></ExerciseImage>
          </TouchableOpacity>
        </Link>
        <View className="flex-1 mx-4">
          <Text numberOfLines={1} className="text-left text-lg font-semibold">
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
    </Card>
  );
};

export default CompletedWorkout;
