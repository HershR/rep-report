import { View, Text } from "react-native";
import React from "react";
import { Stack, Tabs } from "expo-router";
import { NAV_THEME } from "@/src/lib/constants";
import { useColorScheme } from "@/src/lib/useColorScheme";

const UserLayout = () => {
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  return (
    <Stack>
      <Stack.Screen
        name="weight"
        options={{
          title: "Weight",
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default UserLayout;
