import { BottomTabBar } from "@react-navigation/bottom-tabs";
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
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MiniWorkoutBar } from "@/features/workouts/components/MiniWorkoutBar";
import { THEME } from "@/lib/theme";

function tabIcon(IconComponent: LucideIcon) {
  return function TabBarIcon({ color, size }: { color: string; size: number }) {
    return <IconComponent color={color} size={size} />;
  };
}

export default function TabLayout() {
  const { colorScheme: scheme } = useColorScheme();
  const colors = THEME[scheme ?? "light"];
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      tabBar={(props) => (
        <View>
          <MiniWorkoutBar />
          <BottomTabBar {...props} />
        </View>
      )}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text3,
        tabBarStyle: {
          backgroundColor: colors.surfaceSunken,
          borderTopColor: colors.border,
          height: 62 + insets.bottom,
          paddingTop: 10,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: {
          fontFamily: "IBMPlexMono_600SemiBold",
          fontSize: 9,
          letterSpacing: 0.9,
          marginTop: 3,
        },
        tabBarIconStyle: { marginTop: 2 },
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.foreground,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarLabel: "TODAY",
          tabBarIcon: tabIcon(Home),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarLabel: "SEARCH",
          tabBarIcon: tabIcon(Search),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarLabel: "PROGRESS",
          tabBarIcon: tabIcon(BarChart3),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarLabel: "SAVED",
          tabBarIcon: tabIcon(Bookmark),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "PROFILE",
          tabBarIcon: tabIcon(User),
        }}
      />
    </Tabs>
  );
}
