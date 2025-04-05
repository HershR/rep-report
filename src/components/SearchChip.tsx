import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface Props {
  item: { id: number | string; name: string };
  disabled: boolean;
  onPress?: () => void;
}
export const SearchChip = ({ item, onPress, disabled = true }: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className="bg-gray-200 rounded-full px-4 py-3"
    >
      <Text numberOfLines={1} className="text-accent text-center text-md">
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};
