import { View, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Link } from "expo-router";
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
      <TouchableOpacity className="flex w-36 relative justify-center items-center">
        <Image
          source={{
            uri: !!image ? image : undefined,
          }}
          className="w-36 h-36 rounded-lg bg-white"
          resizeMode="contain"
        ></Image>
        {!!!image && (
          <View className="absolute top-1/3 justify-center items-center">
            <Text className="text-black text-xl text-center">
              No Image Found
            </Text>
          </View>
        )}
        <Text
          numberOfLines={1}
          className="text-md font-semibold mt-1 mx-2 text-primary"
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
