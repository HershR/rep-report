import { View, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { Exercise, ExerciseInfo, Workout } from "../interfaces/interface";
import { toUpperCase } from "../services/textFormatter";
import { Text } from "~/components/ui/text";

const RecentExerciseCard = ({
  id,
  name,
  category,
  wger_id,
  image,
}: Exercise) => {
  return (
    <Link href={`/exercise/${wger_id}`} asChild>
      <TouchableOpacity className="w-36 relative justify-center items-center">
        <Image
          source={{
            uri: !!image ? image : undefined,
          }}
          className="w-36 h-36 rounded-lg bg-border"
          resizeMode="cover"
        ></Image>
        {!!!image && (
          <View className="absolute top-1/3 m-0 p-0 justify-center items-center">
            <Text className="text-primary text-xl text-center">
              No Image Found
            </Text>
          </View>
        )}
        <Text
          numberOfLines={1}
          className="text-sm font-bold mt-1 mx-2 text-primary"
        >
          {toUpperCase(name)}
        </Text>
        <Text className="text-primary text-sm font-medium bg-accent rounded-lg absolute top-2 right-2 px-2">
          {category}
        </Text>
      </TouchableOpacity>
    </Link>
  );
};

export default RecentExerciseCard;
