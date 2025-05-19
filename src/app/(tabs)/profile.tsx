import { ScrollView, TouchableOpacity, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Text } from "@/src/components/ui/text";
import { User } from "@/src/lib/icons/User";
import { MoonStar } from "@/src/lib/icons/MoonStar";
import { Sun } from "@/src/lib/icons/Sun";
import { Switch } from "@/src/components/ui/switch";
import { useColorScheme } from "@/src/lib/useColorScheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card, CardContent } from "@/src/components/ui/card";
import { Separator } from "~/components/ui/separator";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "@/src//db/schema";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NAV_THEME } from "@/src/lib/constants";
import { Button } from "@/src/components/ui/button";
import { ChevronRight } from "@/src/lib/icons/ChevronRight";
import { useRouter } from "expo-router";
import { useMeasurementUnit } from "@/src/context/MeasurementUnitContext";
import { UNIT_LABELS } from "@/src/constants/measurementLables";
import {
  convertHeightString,
  convertWeightString,
  Unit,
} from "@/src/utils/measurementConversion";

const Profile = () => {
  const isMountingRef = useRef(false);
  const [age, setAge] = useState<number | null>();
  const [height, setHeight] = useState<number | null>();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const { colorScheme, isDarkColorScheme, toggleColorScheme } =
    useColorScheme();

  const router = useRouter();
  const { unit, toggleUnit } = useMeasurementUnit();
  const {
    data: weight,
    error: weightError,
    updatedAt: weightLoaded,
  } = useLiveQuery(
    drizzleDb.query.weightHistory.findFirst({
      orderBy: (weight_history, { desc }) => [
        desc(weight_history.date_created),
      ],
    })
  );
  const getAge = async () => {
    const dob = await AsyncStorage.getItem("dateOfBirth");
    if (dob) {
      const date = new Date(dob);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < date.getDate())
      ) {
        setAge(age - 1);
      } else {
        setAge(age);
      }
    } else {
      setAge(0);
    }
  };
  const getHeight = async () => {
    const _height = await AsyncStorage.getItem("height");
    setHeight(parseFloat(_height || "0"));
  };

  const setUnit = async (unit: Unit) => {
    await AsyncStorage.setItem("measurementUnit", unit);
  };
  const setTheme = async (theme: string) => {
    await AsyncStorage.setItem("theme", theme);
  };

  useEffect(() => {
    isMountingRef.current = true;
    getAge();
    getHeight();
  }, []);

  useEffect(() => {
    if (!isMountingRef.current) {
      setUnit(unit);
    } else {
      isMountingRef.current = false;
    }
  }, [unit]);
  useEffect(() => {
    if (!isMountingRef.current) {
      setTheme(colorScheme);
    } else {
      isMountingRef.current = false;
    }
  }, [colorScheme]);

  return (
    <SafeAreaWrapper>
      <Text className="text-3xl text-left w-full">Profile</Text>
      <Card className="flex-row w-full h-1/4 pt-6 mt-16">
        <CardContent className="flex justify-center items-center">
          <View className="w-32 aspect-square rounded-full bg-secondary justify-center items-center overflow-hidden">
            <User className="color-primary" size={80}></User>
          </View>
        </CardContent>
        <CardContent className="flex-1 justify-center">
          <View className="flex-1 flex-row justify-between items-center">
            <Text className="text-xl font-medium text-left">Age</Text>
            <Text className="text-xl font-medium text-right">{age} yr</Text>
          </View>
          <Separator className="" />
          <View className="flex-1 flex-row justify-between items-center">
            <Text className="text-xl font-medium text-left">Height</Text>
            <Text className="text-xl font-medium text-right">
              {height ? convertHeightString(height, "metric", unit) : "NA"}
            </Text>
          </View>
          <Separator className="" />
          <View className="flex-1 flex-row justify-between items-center">
            <Text className="text-xl font-medium text-left">Weight</Text>
            <TouchableOpacity onPress={() => router.push("/weight")}>
              <Text className="text-xl font-medium text-right">
                {weight?.weight
                  ? convertWeightString(weight.weight, "metric", unit)
                  : "NA"}
              </Text>
            </TouchableOpacity>
          </View>
        </CardContent>
      </Card>

      <Card className="flex-1 mt-4">
        <CardContent className="flex-1">
          <ScrollView
            className="flex-1 w-full mt-8"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-y-4"
          >
            <View className="flex-1 flex-row h-14 rounded-md bg-background justify-between items-center px-4">
              <Text className="text-xl font-medium">App Theme</Text>
              <View className="flex-row items-center gap-x-2">
                <Sun className="color-primary" size={24} />
                <Switch
                  checked={isDarkColorScheme}
                  onCheckedChange={() => toggleColorScheme()}
                  nativeID="airplane-mode"
                />
                <MoonStar className="color-primary" size={24} />
              </View>
            </View>
            <Separator />
            <View className="flex-1 flex-row h-14 rounded-md bg-background justify-between items-center px-4">
              <Text className="text-xl font-medium">My Weight</Text>
              <Button
                variant={"ghost"}
                size="icon"
                className="flex-row w-14"
                onPress={() => router.push("/weight")}
              >
                <Ionicons
                  name="scale"
                  size={24}
                  color={
                    colorScheme === "light"
                      ? NAV_THEME.light.primary
                      : NAV_THEME.dark.primary
                  }
                />
                <ChevronRight size={24} className="color-primary" />
              </Button>
            </View>
            <Separator />

            <View className="flex-1 flex-row h-14 rounded-md bg-background justify-between items-center px-4">
              <Text className="text-xl font-medium">Units</Text>
              <View className="flex-row items-center gap-x-2">
                <Text className="w-6 text-center text-xl font-semibold">
                  Lb
                </Text>
                <Switch
                  checked={unit !== "imperial"}
                  onCheckedChange={() => toggleUnit()}
                  nativeID="airplane-mode"
                />
                <Text className="w-6 text-center text-xl font-semibold">
                  Kg
                </Text>
              </View>
            </View>
            <Button onPress={() => router.replace("../index")}>
              <Text>To Onboarding</Text>
            </Button>
            <Text>{unit}</Text>
          </ScrollView>
        </CardContent>
      </Card>
    </SafeAreaWrapper>
  );
};

export default Profile;
