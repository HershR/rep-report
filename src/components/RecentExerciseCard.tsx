import { View, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { toUpperCase } from "../services/textFormatter";
import { Text } from "~/components/ui/text";
import ExerciseImage from "./ExerciseImage";
import { Card } from "./ui/card";
const RecentExerciseCard = ({
  id,
  name,
  category,
  wger_id,
  image,
}: Exercise) => {
  return (
    <Link href={`/exercise/${wger_id}`} asChild>
      <TouchableOpacity className="w-36">
        <Card className="flex justify-center items-center px-2 pt-4">
          <ExerciseImage
            image_uri={image}
            imageClassname={"w-32 h-32 rounded-md bg-white"}
            textClassname={"text-black text-xl text-center"}
          ></ExerciseImage>
          <Text numberOfLines={1} className="text-lg font-semibold mt-1">
            {toUpperCase(name)}
          </Text>
          <Text className="absolute top-2 right-2 text-sm font-medium text-muted-foreground bg-accent rounded-full px-3">
            {category}
          </Text>
        </Card>
      </TouchableOpacity>
    </Link>
  );
};

export default RecentExerciseCard;
