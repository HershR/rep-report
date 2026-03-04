import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Tabs } from 'expo-router';
import { Dumbbell, Home, LucideIcon, Search, User } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
interface TabIconProps {
  title: string;
  tabIcon: LucideIcon;
  focused: boolean;
}

const TabIcon = ({ title, tabIcon, focused }: TabIconProps) => {
  if (focused)
    return (
      <View className="mt-4 min-h-16 w-full min-w-28 flex-1 items-center justify-center overflow-hidden rounded-full">
        <Icon className="color-primary" as={tabIcon} size={20} />
        <Text className="ml-2 font-semibold">{title}</Text>
      </View>
    );
  return (
    <View className="mt-4 size-full items-center justify-center rounded-full">
      <Icon className="color-primary/50" as={tabIcon} size={20} />
    </View>
  );
};
const _Layout = () => {
  return (
    <Tabs screenOptions={{ tabBarShowLabel: false }}>
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon title="Home" tabIcon={Home} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Dashboard" tabIcon={Dumbbell} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Search" tabIcon={Search} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon title="Profile" tabIcon={User} focused={focused} />,
        }}
      />
    </Tabs>
  );
};
export default _Layout;
