import { View } from "react-native";
import React from "react";
import { ActivityIndicator } from "react-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "@/src/lib/useColorScheme";
const ActivityLoader = () => {
  const { isDarkColorScheme } = useColorScheme();
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator
        size={"large"}
        color={isDarkColorScheme ? NAV_THEME.dark.text : NAV_THEME.light.text}
        className="my-3"
      />
    </View>
  );
};

export default ActivityLoader;
