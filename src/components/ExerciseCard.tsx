import { View, TouchableOpacity } from "react-native";
import React from "react";
import { Card } from "./ui/card";
import ExerciseImage from "./ExerciseImage";
import { Text } from "./ui/text";
import { useRouter } from "expo-router";
import { Badge } from "./ui/badge";

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
      <Card className="relative flex-1 justify-center items-center overflow-hidden">
        <ExerciseImage
          image_uri={image}
          containerClassname="w-full"
          contextFit="contain"
        />
        {/* <Text className="absolute top-2 right-2 text-sm font-medium text-white bg-black rounded-full px-3 py-2">
          
        </Text> */}
        <View className="absolute -bottom-1 left-0 right-0 w-full h-16 max-h-[35%] bg-secondary/80 justify-center px-2">
          <Text
            className={`w-full text-left text-base md:text-xl lg:text-2xl font-bold pb-2`}
            numberOfLines={2}
          >
            {name}
          </Text>
        </View>
        <Badge variant={"secondary"} className="absolute top-2 right-2">
          <Text className="text-base md:text-xl lg:text-2xl">{category}</Text>
        </Badge>
      </Card>
    </TouchableOpacity>
  );
};

export default ExerciseCard;
