import { useState } from "react";
import { View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useColorScheme } from "@/src/lib/useColorScheme";
import { OnboardingPageProps } from "../OnboardingScreen";
//db
import * as schema from "@/src/db/schema";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { updateUserSetting } from "@/src/db/dbHelpers";
//icons
//ui
import { Button } from "../../ui/button";
import { Text } from "../../ui/text";
import { utcToLocalMidnight } from "@/src/utils/datetimeConversion";

const AskAge = ({ onContinue }: OnboardingPageProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const { isDarkColorScheme } = useColorScheme();
  const handleDateConfirm = (date: Date) => {
    const tzDate = utcToLocalMidnight(date);
    setDatePickerVisibility(false);
    setSelectedDate(tzDate);
  };
  return (
    <View className="flex-1">
      <Animated.View
        entering={FadeInDown.duration(600)}
        className="flex-1 justify-center items-center"
      >
        <Animated.Image
          entering={FadeInUp.duration(600).delay(300)}
          source={require("@/src/assets/images/icon.png")}
          className="w-full h-64 mb-20"
          resizeMode="contain"
        />
        <Animated.Text
          entering={FadeIn.duration(600)}
          className="text-primary text-2xl font-bold mb-6 text-center"
        >
          When were you born?
        </Animated.Text>
        <Button
          onPress={() => setDatePickerVisibility(true)}
          variant={"outline"}
          size={"lg"}
          className="w-64"
        >
          <Text className="text-2xl font-bold">
            {selectedDate?.toDateString()}
          </Text>
        </Button>
      </Animated.View>
      <View className="items-center">
        <Button
          className="min-w-52 mb-4"
          size={"lg"}
          disabled={selectedDate === null}
          onPress={async () => {
            if (selectedDate === null) {
              return;
            }
            await updateUserSetting(
              drizzleDb,
              "dob",
              selectedDate.toISOString()
            );
            onContinue();
          }}
        >
          <Text>Continue</Text>
        </Button>
        <Button variant={"ghost"} size={"lg"} onPress={onContinue}>
          <Text>Skip</Text>
        </Button>
      </View>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        isDarkModeEnabled={isDarkColorScheme}
        is24Hour={true}
        date={new Date()}
        onConfirm={(date) => {
          handleDateConfirm(date);
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
      ></DateTimePickerModal>
    </View>
  );
};

export default AskAge;
