import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Card } from "./ui/card";
import ExerciseImage from "./ExerciseImage";
import { Image } from "expo-image";

interface Props {
  exercise: Omit<Exercise, "is_favorite">; // Exclude is_favorite from the props
  textClassname?: string; // Optional classname for text
  containerClassname?: string; // Optional classname for the container
  onPress?: () => void; // Optional onPress handler
}

const ExerciseCard = ({
  exercise,
  onPress,
  textClassname = "",
  containerClassname = "",
}: Props) => {
  const { id, name, category, image } = exercise;

  return (
    <TouchableOpacity
      className={`flex  ${containerClassname}`}
      onPress={onPress}
    >
      <Card className="relative flex-1 justify-center items-center overflow-hidden">
        <ExerciseImage image_uri={image} containerClassname="w-full" />
        <Text className="absolute top-2 right-2 text-sm font-medium text-secondary bg-primary rounded-full px-3">
          {category}
        </Text>
      </Card>
      <View className=" absolute bottom-0 h-1/3 w-full justify-center bg-secondary/80  px-2">
        <Text
          className={`text-lg font-bold text-black ${textClassname}`}
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ExerciseCard;
