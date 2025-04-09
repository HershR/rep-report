import { View, Image } from "react-native";
import React from "react";
import { icons } from "@/src/constants/icons";
import { Input } from "~/components/ui/input";

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
    <View className="flex-row items-center">
      <Input
        onPress={onPress}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        className="flex-1 pl-12"
      ></Input>
      <Image
        source={icons.search}
        className="size-5 absolute left-0 ml-4"
        resizeMode="contain"
        tintColor="#2b2e3d"
      />
    </View>
  );
};

export default SearchBar;
