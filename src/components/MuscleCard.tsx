import React from "react";
import { View } from "react-native";
import { SvgUri } from "react-native-svg";
import { Text } from "~/components/ui/text";
import ExerciseImage from "./ExerciseImage";

interface MuscleCardProps {
  muscleList: Muscles[] | undefined;
  isFront: boolean;
}

const MuscleCard = ({ muscleList, isFront }: MuscleCardProps) => {
  if (muscleList === undefined || muscleList.length === 0) {
    return null;
  }
  const base = isFront ? (
    <ExerciseImage
      image_uri={`https://wger.de/static/react/muscles/muscular_system_front.svg`}
      containerClassname="w-[200px] h-[400px]"
      imageStyle={{ backgroundColor: "transparent" }}
    ></ExerciseImage>
  ) : (
    <ExerciseImage
      image_uri={
        "https://wger.de/static/react/muscles/muscular_system_back.svg"
      }
      containerClassname="w-[200px] h-[400px]"
      imageStyle={{ backgroundColor: "transparent" }}
    ></ExerciseImage>
  );
  const muscles = muscleList.map((x, index) => (
    <ExerciseImage
      key={x.name}
      image_uri={`https://wger.de${
        index == 0 ? x.image_url_main : x.image_url_secondary
      }`}
      containerClassname="absolute w-[200px] h-[400px]"
      imageStyle={{ backgroundColor: "transparent" }}
    ></ExerciseImage>
  ));
  return (
    <View className="flex-1 justify-center items-center">
      <View className="relative flex-1 justify-center items-center">
        {base}
        {muscles}
      </View>
      <Text className="text-center text-lg text-wrap w-[80%]">
        {muscleList.map((x) => x.name).join(", ")}
      </Text>
    </View>
  );
};

export default MuscleCard;
