import { Tabs } from "expo-router";
import {
  BarChart3,
  Bookmark,
  Home,
  Search,
  User,
  type LucideIcon,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";

import { THEME } from "@/lib/theme";

function tabIcon(IconComponent: LucideIcon) {
  return function TabBarIcon({ color, size }: { color: string; size: number }) {
    return <IconComponent color={color} size={size} />;
  };
}

export default function TabLayout() {
  const { colorScheme: scheme } = useColorScheme();
  const colors = THEME[scheme ?? "light"];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.foreground,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: tabIcon(Home),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: tabIcon(Search),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: tabIcon(BarChart3),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: tabIcon(Bookmark),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: tabIcon(User),
        }}
      />
    </Tabs>
  );
}
