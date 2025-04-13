import {
  View,
  Text,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import React from "react";
import { Link } from "expo-router";
import ExerciseImage from "./ExerciseImage";
import { Card } from "./ui/card";

const SearchExerciseCard = ({ value, data }: ExerciseSuggestion) => {
  const { id, base_id, name, category, image, image_thumbnail } = data;
  return (
    <Link href={`/exercise/${base_id}`} asChild>
      <TouchableOpacity className="flex-1 aspect-square">
        {/* <View>
          <Image
            source={{
              uri: image_thumbnail ? `https://wger.de/${image}` : undefined,
            }}
            className="w-full h-full rounded-md bg-white"
            resizeMode="cover"
          />
          <Text></Text>
        </View> */}
        <Card className="relative flex-1 justify-center items-center overflow-hidden">
          <ExerciseImage
            image_uri={!!image ? `https://wger.de/${image}` : null}
            imageClassname={`h-full aspect-square rounded-md bg-white`}
            textClassname={"text-xl text-black text-center"}
          ></ExerciseImage>
          <View
            className=" absolute bottom-0 h-1/4 w-full justify-end"
            style={{ backgroundColor: "#ffffffbb" }}
          >
            <View className="justify-center items-start ml-2 my-1">
              <Text className="text-lg font-bold text-black" numberOfLines={1}>
                {name}
              </Text>
              <Text className="text-md text-black"> ({category})</Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </Link>
  );
};

export default SearchExerciseCard;
