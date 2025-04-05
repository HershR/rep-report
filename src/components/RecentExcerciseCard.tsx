import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { ExerciseInfo } from "../interfaces/interface";
import { toCamelCase } from "../services/textFormatter";

const RecentExerciseCard = (item: ExerciseInfo) => {
  const translation = item.translations.find((x) => x.language === 2);
  return (
    <Link href={`/exercise/${item.id}`} asChild>
      <TouchableOpacity className="w-24 relative">
        <Image
          source={{
            uri: item.images.length > 0 ? item.images[0].image : undefined,
          }}
          className="w-24 h-36 rounded-lg bg-accent"
          resizeMode="cover"
        ></Image>
        <Text
          numberOfLines={2}
          className="text-left text-sm font-bold mt-1 ml-1 text-primary"
        >
          {toCamelCase(translation?.name!)}
        </Text>
        <Text className="text-accent text-sm bg-secondary rounded-lg absolute top-2 right-2 px-1">
          {item.category.name}
        </Text>
      </TouchableOpacity>
    </Link>
  );
};

export default RecentExerciseCard;
