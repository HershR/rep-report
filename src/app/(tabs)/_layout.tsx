import { View } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { Text } from "@/src/components/ui/text";
import { LucideIcon } from "lucide-react-native";
import { Search } from "~/lib/icons/Search";
import { House } from "~/lib/icons/House";
import { User } from "~/lib/icons/User";
import { Bookmark } from "~/lib/icons/Bookmark";
import { Dumbbell } from "~/lib/icons/Dumbbell";
import { useColorScheme } from "@/src/lib/useColorScheme";
import { NAV_THEME } from "~/lib/constants";
interface TabIconProps {
  title: string;
  Icon: LucideIcon;
  focused: boolean;
}

const TabIcon = ({ title, Icon, focused }: TabIconProps) => {
  if (focused)
    return (
      <View className="flex-1 flex-row w-full min-w-28 min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden">
        <Icon className="color-primary" size={20} />
        <Text className="font-semibold ml-2">{title}</Text>
      </View>
    );
  return (
    <View className="size-full justify-center items-center mt-4 rounded-full">
      <Icon className="color-primary/50" size={20} />
    </View>
  );
};
const _Layout = () => {
  const { colorScheme, isDarkColorScheme } = useColorScheme();

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

        tabBarStyle: {
          backgroundColor: `${
            isDarkColorScheme
              ? NAV_THEME.dark.background
              : NAV_THEME.light.background
          }`,
          overflow: "hidden",
          position: "absolute",
          height: 56,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Home" Icon={House} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Search" Icon={Search} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: "Workouts",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Workouts" Icon={Dumbbell} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Saved" Icon={Bookmark} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Profile" Icon={User} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
};
export default _Layout;
