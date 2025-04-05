import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { ExerciseInfo } from "../interfaces/interface";
import { toCamelCase as firstLetterUpperCase } from "../services/textFormatter";

const RecentExerciseCard = (item: ExerciseInfo) => {
  const translation = item.translations.find((x) => x.language === 2);
  return (
    <Link href={`/exercise/${item.id}`} asChild>
      <TouchableOpacity className="flex-1 w-36 relative items-center">
        <Image
          source={{
            uri: item.images.length > 0 ? item.images[0].image : undefined,
          }}
          className="w-36 h-36 rounded-lg bg-gray-300 border-2"
          resizeMode="cover"
        ></Image>
        {item.images.length === 0 && (
          <View className="absolute top-1/3 m-0 p-0 justify-center items-center">
            <Text className="text-xl text-center">No Image Found</Text>
          </View>
        )}
        <Text
          numberOfLines={1}
          className="text-left text-sm font-bold mt-1 ml-1 text-primary"
        >
          {firstLetterUpperCase(translation?.name!)}
        </Text>
        <Text className="text-accent text-sm bg-secondary rounded-lg absolute top-2 right-2 px-1">
          {item.category.name}
        </Text>
      </TouchableOpacity>
    </Link>
  );
};

export default RecentExerciseCard;
