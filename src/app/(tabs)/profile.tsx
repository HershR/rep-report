import { ScrollView, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
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
import { Button } from "@/src/components/ui/button";

const setTheme = async (theme: string) => {
  console.log("set theme:", theme);
  await AsyncStorage.setItem("theme", theme);
};
const Profile = () => {
  const isMountingRef = useRef(false);
  const [age, setAge] = useState<string | null>();
  const [weight, setWeight] = useState<string | null>();
  const [height, setHeight] = useState<string | null>();

  const { colorScheme, isDarkColorScheme, toggleColorScheme } =
    useColorScheme();

  const getAge = async () => {
    const _age = await AsyncStorage.getItem("age");
    setAge(_age || "0");
  };
  const getWeight = async () => {
    const _weight = await AsyncStorage.getItem("weight");
    setWeight(_weight || "0");
  };

  const getHeight = async () => {
    const _height = await AsyncStorage.getItem("height");
    setHeight(_height || "0");
  };

  useEffect(() => {
    isMountingRef.current = true;
    getAge();
    getWeight();
    getHeight();
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
      <SafeAreaView className="flex-1 mx-8 mt-10 pb-20 justify-center gap-y-6">
        <Text className="text-3xl text-left w-full">Profile</Text>
        <Card className="flex-row w-full h-1/4 pt-6">
          <CardContent className="flex justify-center items-center">
            <View className="w-32 aspect-square rounded-full bg-secondary justify-center items-center overflow-hidden">
              <User className="color-primary" size={80}></User>
            </View>
          </CardContent>
          <CardContent className="flex-1 justify-center">
            <View className="flex-1 flex-row justify-between items-center">
              <Text className="text-sm font-medium text-left">Age</Text>
              <Text className="text-xl font-medium text-right">{age} yr</Text>
            </View>
            <Separator className="" />
            <View className="flex-1 flex-row justify-between items-center">
              <Text className="text-sm font-medium text-left">Weight</Text>
              <Text className="text-xl font-medium text-right">
                {weight} lb
              </Text>
            </View>
            <Separator className="" />
            <View className="flex-1 flex-row justify-between items-center">
              <Text className="text-sm font-medium text-left">Height</Text>
              <Text className="text-xl font-medium text-right">
                {height} ft
              </Text>
            </View>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardContent className="flex-1">
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
              <Separator className="" />
            </ScrollView>
          </CardContent>
        </Card>
      </SafeAreaView>
    </View>
  );
};

export default Profile;
