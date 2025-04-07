import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { Exercise, ExerciseInfo, Workout } from "../interfaces/interface";
import { toUpperCase } from "../services/textFormatter";

const RecentExerciseCard = ({
  id,
  name,
  category,
  wger_id,
  image,
}: Exercise) => {
  return (
    <Link href={`/exercise/${wger_id}`} asChild>
      <TouchableOpacity className="flex-1 w-36 relative items-center">
        <Image
          source={{
            uri: !!image ? image : undefined,
          }}
          className="w-36 h-36 rounded-lg bg-gray-300"
          resizeMode="cover"
        ></Image>
        {!!!image && (
          <View className="absolute top-1/3 m-0 p-0 justify-center items-center">
            <Text className="text-xl text-center">No Image Found</Text>
          </View>
        )}
        <Text
          numberOfLines={1}
          className="text-left text-sm font-bold mt-1 ml-1 text-primary"
        >
          {toUpperCase(name)}
        </Text>
        <Text className="text-accent text-sm bg-secondary rounded-lg absolute top-2 right-2 px-1">
          {category}
        </Text>
      </TouchableOpacity>
    </Link>
  );
};

export default RecentExerciseCard;
