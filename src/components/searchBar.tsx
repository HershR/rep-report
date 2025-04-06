import { View, Image, TextInput } from "react-native";
import React from "react";
import { icons } from "@/src/constants/icons";

interface SearchBarProps {
  placeholder: string;
  value: string;
  onPress?: () => void;
  onChangeText?: (text: string) => void;
}

const SearchBar = ({
  placeholder,
  value,
  onPress,
  onChangeText,
}: SearchBarProps) => {
  return (
    <View className="flex-row items-center bg-gray-300 rounded-full px-5 py-2">
      <Image
        source={icons.search}
        className="size-5"
        resizeMode="contain"
        tintColor="#2b2e3d"
      />
      <TextInput
        onPress={onPress}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={"#21232f"}
        className="flex-1 text-primary ml-2 "
      />
    </View>
  );
};

export default SearchBar;
