import React from "react";
import { View } from "react-native";
import { ArrowRight } from "@/src/lib/icons/ArrowRight";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { useRouter } from "expo-router";
interface HeaderProps {
  title: string;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onBack }) => {
  const navigation = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.back();
    }
  };

  return (
    <View className="flex-row h-14 items-center px-4 py-3">
      <Button
        size={"icon"}
        variant={"ghost"}
        onPress={handleBack}
        accessibilityLabel="Go back"
        className="rotate-180"
      >
        <ArrowRight size={24} className="color-primary" />
      </Button>
      <Text className="text-2xl font-semibold text-primary ml-4">{title}</Text>
    </View>
  );
};

export default Header;
