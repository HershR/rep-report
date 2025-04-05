import { Muscles } from "@/src/interfaces/interface";
import React from "react";
import { View, Text } from "react-native";
import { SvgUri } from "react-native-svg";

interface MuscleCardProps {
  muscleList: Muscles[] | undefined;
  isFront: boolean;
}

const MuscleCard = ({ muscleList, isFront }: MuscleCardProps) => {
  if (muscleList === undefined || muscleList.length === 0) {
    return null;
  }
  const base = isFront ? (
    <SvgUri
      uri={`https://wger.de/static/react/muscles/muscular_system_front.svg`}
    ></SvgUri>
  ) : (
    <SvgUri
      uri={"https://wger.de/static/react/muscles/muscular_system_back.svg"}
    ></SvgUri>
  );
  const child = muscleList.map((x, index) => (
    <View key={x.name} className="absolute">
      <SvgUri
        uri={`https://wger.de${
          index == 0 ? x.image_url_main : x.image_url_secondary
        }`}
      ></SvgUri>
    </View>
  ));
  return (
    <View className="flex-1 justify-start items-center relative">
      {base}
      {child}
      <Text numberOfLines={2} className="text-primary text-md text-wrap">
        {muscleList.map((x) => x.name).join(", ")}
      </Text>
    </View>
  );
};

export default MuscleCard;
