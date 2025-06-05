import { View } from "react-native";
import React from "react";
import { Input } from "~/components/ui/input";
import { Search } from "~/lib/icons/Search";
interface SearchBarProps {
  placeholder: string;
  value: string;
  autoFocus?: boolean;
  onPress?: () => void;
  onChangeText?: (text: string) => void;
}

const SearchBar = ({
  placeholder,
  value,
  autoFocus = false,
  onPress,
  onChangeText,
}: SearchBarProps) => {
  return (
    <View className="flex-row items-center">
      <Input
        className="flex-1 pl-12"
        placeholder={placeholder}
        onChangeText={(value) => onChangeText?.(value.trim())}
        value={value}
        onPress={onPress}
        autoFocus={autoFocus}
      ></Input>
      <Search className="color-primary absolute left-0 ml-3"></Search>
    </View>
  );
};

export default SearchBar;
