import { ScrollView, View } from "react-native";
import React, { useEffect, useRef } from "react";
import { Text } from "@/src/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { User } from "@/src/lib/icons/User";
import { MoonStar } from "@/src/lib/icons/MoonStar";
import { Sun } from "@/src/lib/icons/Sun";
import { Switch } from "@/src/components/ui/switch";
import { useColorScheme } from "@/src/lib/useColorScheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card, CardContent } from "@/src/components/ui/card";
import { Separator } from "~/components/ui/separator";

const setTheme = async (theme: string) => {
  console.log("set theme:", theme);
  await AsyncStorage.setItem("theme", theme);
};
const Profile = () => {
  const isMountingRef = useRef(false);
  const { colorScheme, isDarkColorScheme, toggleColorScheme } =
    useColorScheme();

  useEffect(() => {
    isMountingRef.current = true;
  }, []);
  useEffect(() => {
    if (!isMountingRef.current) {
      setTheme(colorScheme);
    } else {
      isMountingRef.current = false;
    }
  }, [colorScheme]);
  return (
    <View className="flex-1 bg-secondary">
      <SafeAreaView className="flex-1 mx-8 mt-10 pb-20 justify-center">
        <Text className="text-3xl mb-4 text-left w-full">Profile</Text>
        <Card className="flex-row w-full h-1/4 pt-6">
          <CardContent className="flex justify-center items-center">
            <View className="w-32 aspect-square rounded-full bg-secondary justify-center items-center overflow-hidden">
              <User className="color-primary" size={80}></User>
            </View>
          </CardContent>
          <CardContent className="flex-1 justify-center">
            <View className="flex-1 flex-row justify-between items-center">
              <Text className="text-s font-medium">Age</Text>
              <Text className="text-xl font-medium">23 yr</Text>
            </View>
            <Separator className="" />
            <View className="flex-1 flex-row justify-between items-center">
              <Text className="text-s font-medium">Weight</Text>
              <Text className="text-xl font-medium">{140} lb</Text>
            </View>
            <Separator className="" />
            <View className="flex-1 flex-row justify-between items-center">
              <Text className="text-s font-medium">Height</Text>
              <Text className="text-xl font-medium">5'6 ft</Text>
            </View>
          </CardContent>
        </Card>
        <ScrollView
          className="flex-1 w-full mt-8"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-y-4"
        >
          <View className="flex-1 flex-row h-14 rounded-md bg-background justify-between items-center px-4">
            <Text className="text-lg font-medium">App Theme</Text>
            <View className="flex-row items-center gap-x-2">
              <Sun className="color-primary" size={20} />
              <Switch
                checked={isDarkColorScheme}
                onCheckedChange={() => toggleColorScheme()}
                nativeID="airplane-mode"
              />
              <MoonStar className="color-primary" size={20} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Profile;
