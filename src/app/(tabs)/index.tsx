import { Text, View } from "react-native";
import DatePickerWithWeek from "@/src/components/datepicker/DatePickerWithWeek";
import { DateTime } from "luxon";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
export default function Index() {
  const [date, setDate] = useState<DateTime>(DateTime.now());
  function updateDate(newDate: DateTime) {
    if (!!newDate) {
      setDate(newDate);
    }
  }
  const test = [1, 2, 3, 4, 5].map((x) => (
    <View key={x} className="flex-1 w-10"></View>
  ));
  return (
    <View className="flex-1 bg-secondary">
      <SafeAreaView className="flex-1 mx-8 my-10">
        <View className="flex">
          <DatePickerWithWeek currentDate={date} onDateChange={updateDate} />
        </View>
        <View className="flex-1 border-2"></View>
      </SafeAreaView>
    </View>
  );
}
