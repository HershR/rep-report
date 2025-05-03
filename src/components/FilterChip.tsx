import { View } from "react-native";
import React from "react";
import { Button } from "./ui/button";
import { CircleX } from "../lib/icons/CircleX";
import { Badge } from "./ui/badge";
import { Text } from "./ui/text";
interface Props {
  value: number | string;
  label: string;
  onPress: () => void;
}

const FilterChip = ({ value, label, onPress }: Props) => {
  return (
    <Badge
      className="flex-row bg-transparent border-2 border-primary/80 justify-center items-center py-2 px-4 gap-x-2"
      variant={"default"}
      key={value}
    >
      <Text className="text-base color-primary/80">{label}</Text>
      <CircleX className="color-primary/80" onPress={() => onPress()} />
    </Badge>
  );
};

export default FilterChip;
