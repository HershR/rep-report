import { View, Text, Image } from "react-native";
import React from "react";

interface Props {
  image_uri: string | null;
  imageClassname: string;
  textClassname: string;
}

const ExerciseImage = ({ image_uri, imageClassname, textClassname }: Props) => {
  return (
    <View className="flex relative justify-center items-center">
      <Image
        source={{
          uri: image_uri || undefined,
        }}
        className={imageClassname}
        resizeMode="contain"
      ></Image>
      {image_uri === null || image_uri.length === 0 ? (
        <View className="absolute">
          <Text className={textClassname}>No Image Found</Text>
        </View>
      ) : null}
    </View>
  );
};

export default ExerciseImage;
