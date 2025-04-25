import { View, TouchableOpacity } from "react-native";
import React from "react";
import { Card } from "./ui/card";
import ExerciseImage from "./ExerciseImage";
import { Image } from "expo-image";
import { Text } from "./ui/text";
import { useRouter } from "expo-router";

interface Props {
  exercise: Omit<Exercise, "is_favorite">; // Exclude is_favorite from the props
  textClassname?: string; // Optional classname for text
  containerClassname?: string; // Optional classname for the container
}

const ExerciseCard = ({
  exercise,
  textClassname = "",
  containerClassname = "",
}: Props) => {
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
        <Text className="absolute top-2 right-2 text-sm font-medium text-white bg-black rounded-full px-3">
          {category}
        </Text>
      </Card>
      <View className=" absolute bottom-0 h-1/3 w-full justify-center bg-secondary/70 px-2 py-2">
        <Text className={`font-bold ${textClassname}`} numberOfLines={1}>
          {name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ExerciseCard;
