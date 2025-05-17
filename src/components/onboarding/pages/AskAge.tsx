import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { Button } from "../../ui/button";
import { Text } from "../../ui/text";
import { View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useState } from "react";
import { OnboardingPageProps } from "./Welcome";
import { CalendarDays } from "@/src/lib/icons/CalendarDays";
import SafeAreaWrapper from "../../SafeAreaWrapper";
const AskAge = ({ onContinue }: OnboardingPageProps) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const handleDateConfirm = (date: Date) => {
    console.log("Selected date: ", date);
    setDatePickerVisibility(false);
    setSelectedDate(date);
    // onContinue();
  };
  return (
    <SafeAreaWrapper backgroundColor="bg-background">
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
          className="text-2xl font-bold mb-6 text-center"
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
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        isDarkModeEnabled={false}
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
        themeVariant="light"
        display="spinner"
      ></DateTimePickerModal>
    </SafeAreaWrapper>
  );
};

export default AskAge;
