import React from "react";
import { View } from "react-native";
import { SvgUri } from "react-native-svg";
import { Text } from "~/components/ui/text";

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
    <View className="flex relative justify-start items-center">
      <View>
        {base}
        {child}
      </View>
      <Text className="text-center text-lg text-wrap w-[80%]">
        {muscleList.map((x) => x.name).join(", ")}
      </Text>
    </View>
  );
};

export default MuscleCard;
