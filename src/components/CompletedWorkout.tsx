import { View, TouchableOpacity, StyleProp, ViewStyle } from "react-native";
import React from "react";
import { toUpperCase } from "../services/textFormatter";
import ExerciseImage from "./ExerciseImage";
import { Text } from "./ui/text";
import { Card } from "./ui/card";
import { Link, useRouter } from "expo-router";
import { ChevronRight } from "@/src/lib/icons/ChevronRight";
interface Props {
  workout: WorkoutWithExercise;
  containerStyle?: StyleProp<ViewStyle>;
}

const CompletedWorkout = ({ workout, containerStyle }: Props) => {
  const image = workout.exercise.image;
  const router = useRouter();
  function goToWorkout(): void {
    return router.push({
      pathname: "../workout/update/[id]",
      params: {
        id: workout.id,
        exerciseId: workout.exercise_id,
        exerciseName: workout.exercise.name,
      },
    });
  }
  return (
    <Card
      className={`flex-1 max-h-32 justify-center items-center p-4 ${containerStyle}`}
    >
      <TouchableOpacity
        className="flex-row w-full h-full justify-between items-center"
        onPress={() => goToWorkout()}
      >
        <Link href={`/exercise/${workout.exercise.id}`} asChild>
          <TouchableOpacity>
            <ExerciseImage
              image_uri={image}
              containerClassname="h-full aspect-square justify-center items-center"
              contextFit="contain"
            ></ExerciseImage>
          </TouchableOpacity>
        </Link>
        <View className="flex-1 mx-4">
          <Text numberOfLines={1} className="text-left text-lg font-semibold">
            {toUpperCase(workout.exercise.name)}
          </Text>
          <Text>({workout.exercise.category})</Text>
          <Text className="text-muted-foreground">
            Sets: {workout.sets.length}
          </Text>
        </View>
        <ChevronRight className="color-primary" size={30} />
      </TouchableOpacity>
    </Card>
  );
};

export default CompletedWorkout;
