import { View, Image } from "react-native";
import React from "react";
import { icons } from "@/src/constants/icons";
import { Input } from "~/components/ui/input";
import { Search } from "~/lib/icons/Search";
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
        onChangeText={(value) => onChangeText?.(value.trim())}
        className="flex-1 pl-12"
      ></Input>
      <Search className="color-primary absolute left-0 ml-3"></Search>
    </View>
  );
};

export default SearchBar;
