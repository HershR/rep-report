import { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import { useMeasurementUnit } from "@/src/context/MeasurementUnitContext";
import {
  convertHeightString,
  convertWeightString,
} from "@/src/utils/measurementConversion";
import HeightSelectorModal from "@/src/components/HeightSelectorModal";
//db
import * as schema from "@/src//db/schema";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import { updateUserSetting } from "@/src/db/dbHelpers";
//ui
import { useColorScheme } from "@/src/lib/useColorScheme";
import { NAV_THEME } from "@/src/lib/constants";
import { Text } from "@/src/components/ui/text";
import { Switch } from "@/src/components/ui/switch";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Separator } from "~/components/ui/separator";
//icons
import { User } from "@/src/lib/icons/User";
import { MoonStar } from "@/src/lib/icons/MoonStar";
import { Sun } from "@/src/lib/icons/Sun";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ChevronRight } from "@/src/lib/icons/ChevronRight";
import { Ruler } from "@/src/lib/icons/Ruler";
import { Cake } from "@/src/lib/icons/Cake";
import { eq } from "drizzle-orm";
import { utcToLocalMidnight } from "@/src/utils/datetimeConversion";

const Profile = () => {
  const [age, setAge] = useState<number | null>();
  const [height, setHeight] = useState<number | null>();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isHeightModalVisible, setHeightModalVisibility] = useState(false);

  const { colorScheme, isDarkColorScheme, toggleColorScheme } =
    useColorScheme();
  const router = useRouter();
  const { unit, toggleUnit } = useMeasurementUnit();

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const { data: weight } = useLiveQuery(
    drizzleDb.query.weightHistory.findFirst({
      orderBy: (weight_history, { desc }) => [
        desc(weight_history.date_created),
      ],
    })
  );
  const { data: userDob } = useLiveQuery(
    drizzleDb.query.userSettings.findFirst({
      where: eq(schema.userSettings.key, "dob"),
    })
  );

  const { data: userHeight } = useLiveQuery(
    drizzleDb.query.userSettings.findFirst({
      where: eq(schema.userSettings.key, "height"),
    })
  );

  useEffect(() => {
    if (userDob) {
      const date = new Date(userDob.value);
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
  }, [userDob]);

  useEffect(() => {
    const getHeight = async () => {
      if (userHeight) {
        setHeight(parseFloat(userHeight.value));
      } else {
        setHeight(0);
      }
    };
    getHeight();
  }, [userHeight]);

  const setUnit = async (unit: Unit) => {
    await AsyncStorage.setItem("measurementUnit", unit);
  };
  const setTheme = async (theme: string) => {
    await AsyncStorage.setItem("theme", theme);
  };

  return (
    <>
      <SafeAreaWrapper>
        <Card className="flex-1 max-w-screen-md pt-6 mt-4">
          <View className="flex-row">
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
                <Text className="text-xl font-medium text-right">
                  {weight?.weight
                    ? convertWeightString(weight.weight, "imperial", unit)
                    : "NA"}
                </Text>
              </View>
            </CardContent>
          </View>
          <CardContent className="flex-1">
            <Separator />

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
                    onCheckedChange={async () => {
                      await setTheme(
                        colorScheme === "light" ? "dark" : "light"
                      );
                      toggleColorScheme();
                    }}
                  />
                  <MoonStar className="color-primary" size={24} />
                </View>
              </View>
              <Separator />
              <View className="flex-1 flex-row h-14 rounded-md bg-background justify-between items-center px-4">
                <Text className="text-xl font-medium">Units</Text>
                <View className="flex-row items-center gap-x-2">
                  <Text className="min-w-6 text-center text-xl font-semibold">
                    Lb
                  </Text>
                  <Switch
                    checked={unit === "metric"}
                    onCheckedChange={async () => {
                      await setUnit(
                        unit === "imperial" ? "metric" : "imperial"
                      );
                      toggleUnit();
                    }}
                  />
                  <Text className="min-w-6 text-center text-xl font-semibold">
                    Kg
                  </Text>
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
                <Text className="text-xl font-medium">Update Height</Text>
                <Button
                  variant={"ghost"}
                  size="icon"
                  className="flex-row w-14"
                  onPress={() => setHeightModalVisibility(true)}
                >
                  <Ruler className="color-primary" />
                  <ChevronRight size={24} className="color-primary" />
                </Button>
              </View>
              <Separator />
              <View className="flex-1 flex-row h-14 rounded-md bg-background justify-between items-center px-4">
                <Text className="text-xl font-medium">Update Age</Text>
                <Button
                  variant={"ghost"}
                  size="icon"
                  className="flex-row w-14"
                  onPress={() => setDatePickerVisibility(true)}
                >
                  <Cake className="color-primary" />
                  <ChevronRight size={24} className="color-primary" />
                </Button>
              </View>
            </ScrollView>
          </CardContent>
        </Card>
      </SafeAreaWrapper>
      <View className="flex">
        <HeightSelectorModal
          isVisable={isHeightModalVisible}
          defaultHeight={height || 0}
          unit={unit}
          onSubmit={async (height: number) => {
            if (height) {
              await updateUserSetting(drizzleDb, "height", height.toString());
            }
            setHeightModalVisibility(false);
          }}
          onClose={() => {
            setHeightModalVisibility(false);
          }}
        />
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        isDarkModeEnabled={isDarkColorScheme}
        date={userDob?.value ? new Date(userDob.value) : new Date()}
        onConfirm={async (date) => {
          if (date) {
            const tzDate = utcToLocalMidnight(date);
            await updateUserSetting(drizzleDb, "dob", tzDate.toISOString());
          }
          setDatePickerVisibility(false);
        }}
        onCancel={() => {
          setDatePickerVisibility(false);
        }}
        minimumDate={new Date(1900, 0, 1)}
        maximumDate={new Date()}
        timePickerModeAndroid="spinner"
        modalPropsIOS={{
          presentationStyle: "formSheet",
        }}
      />
    </>
  );
};

export default Profile;
