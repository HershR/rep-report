import { View, Text, Image, ImageSourcePropType } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { icons } from "@/src/constants/icons";

interface TabIconProps {
  title: string;
  imgSrc: ImageSourcePropType;
  focused: boolean;
}

const TabIcon = ({ title, imgSrc, focused }: TabIconProps) => {
  if (focused)
    return (
      <View className="flex flex-1 flex-row w-full min-w-[112px] min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden">
        <Image source={imgSrc} tintColor={"#151212"} className="size-5" />
        <Text className="text-secondary text-base font-semibold ml-2">
          {title}
        </Text>
      </View>
    );
  return (
    <View className="size-full justify-center items-center mt-4 rounded-full">
      <Image source={imgSrc} tintColor={"#A8B5DB"} className="size-5"></Image>
    </View>
  );
};

const _Layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: "#2A2E3C",
          position: "absolute",
          overflow: "hidden",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Home" imgSrc={icons.home} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Search" imgSrc={icons.search} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
};
export default _Layout;
