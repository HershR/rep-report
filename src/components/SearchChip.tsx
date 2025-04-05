import React from "react";
import { TouchableOpacity, Text } from "react-native";

export const SearchChip = (item: { id: number; name: string }) => {
  const onPress = () => {};
  return (
    <TouchableOpacity className="bg-gray-200 rounded-full px-4 py-3">
      <Text numberOfLines={1} className="text-accent text-center text-md">
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};
