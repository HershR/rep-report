import { View, TouchableOpacity } from "react-native";
import React from "react";
import { Card } from "./ui/card";
import ExerciseImage from "./ExerciseImage";
import { Text } from "./ui/text";
import { useRouter } from "expo-router";

interface Props {
  exercise: Omit<Exercise, "is_favorite">; // Exclude is_favorite from the props
  containerClassname?: string; // Optional classname for the container
}

const ExerciseCard = ({ exercise, containerClassname = "" }: Props) => {
  const { id, name, category, image } = exercise;
  const router = useRouter();
  function goToExercise(): void {
    router.push(`/exercise/${id}`);
  }
  return (
    <TouchableOpacity
      className={`relative flex overflow-hidden ${containerClassname}`}
      onPress={goToExercise}
    >
      <Card className="flex-1 justify-center items-center">
        <ExerciseImage
          image_uri={image}
          containerClassname="w-full"
          contextFit="contain"
        />
        {/* <Text className="absolute top-2 right-2 text-sm font-medium text-white bg-black rounded-full px-3 py-2">
          
        </Text> */}
      </Card>
      <View className="absolute bottom-0 w-full h-16 max-h-[30%] bg-secondary/70 justify-center px-2">
        <Text
          className={`w-full text-left text-base md:text-xl lg:text-2xl font-bold`}
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text className="text-base md:text-xl lg:text-2xl">{category}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ExerciseCard;
