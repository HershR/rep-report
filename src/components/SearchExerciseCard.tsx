import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { ExerciseSuggestion } from "../interfaces/interface";
import { Link } from "expo-router";

const SearchExerciseCard = ({ value, data }: ExerciseSuggestion) => {
  const { id, base_id, name, category, image, image_thumbnail } = data;
  return (
    <Link href={`/exercise/${base_id}`} asChild>
      <TouchableOpacity className="w-[50%] aspect-square justify-center items-center">
        <Image
          source={{
            uri: image_thumbnail ? `https://wger.de/${image}` : undefined,
          }}
          className="w-full h-full rounded-lg bg-gray-300"
          resizeMode="cover"
        />
        <View
          className=" absolute bottom-0 h-1/4 w-full justify-end overflow-hidden"
          style={{ backgroundColor: "#ffffffbb" }}
        >
          <View className="justify-center items-start ml-2">
            <Text className="text-lg font-bold text-primary" numberOfLines={1}>
              {name}
            </Text>
            <Text className="text-md text-primary"> ({category})</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default SearchExerciseCard;
