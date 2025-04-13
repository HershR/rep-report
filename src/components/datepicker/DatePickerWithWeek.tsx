import { View } from "react-native";
import React, { useState } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { ChevronRight } from "~/lib/icons/ChevronRight";
import { DateTime } from "luxon";
import { Button } from "../ui/button";
import { Text } from "~/components/ui/text";
import { CalendarDays } from "@/src/lib/icons/CalendarDays";
interface CustomDatePickerProps {
  currentDate: DateTime;
  onDateChange: (args0: DateTime) => void;
}

const DatePickerWithWeek = ({
  currentDate,
  onDateChange,
}: CustomDatePickerProps) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    const newDate: DateTime = DateTime.fromJSDate(date);
    hideDatePicker();
    updateDate(newDate);
  };
  const updateDate = (date: DateTime) => {
    onDateChange(date);
  };
  const updateWeek = (amt: number) => {
    updateDate(currentDate.plus({ week: amt }));
  };
  const createDateChips = () => {
    const days: DateTime[] = [];
    let start = currentDate.startOf("week");
    for (let i = 0; i < 7; i++) {
      days.push(start);
      start = start.plus({ day: 1 });
    }

    return days.map((date) => {
      const bgColor =
        currentDate.day !== date.day ? "bg-background" : "bg-primary";
      const textColor =
        currentDate.day !== date.day ? "text-primary" : "text-border";
      return (
        <Button
          key={date.day}
          className={`flex-1 h-full rounded-md justify-center items-center ${bgColor}`}
          size={"icon"}
          onPress={() => {
            updateDate(date);
          }}
        >
          <Text className={`text-center text-md ${textColor}`}>
            {date.weekdayShort}
          </Text>
          <Text className={`text-center text-xs -my-1 ${textColor}`}>
            {date.day < 10 ? `0${date.day}` : date.day}
          </Text>
        </Button>
      );
    });
  };

  return (
    <View className="flex-1 w-full justify-center items-center gap-y-2">
      <View className="flex flex-row w-full justify-center items-center gap-x-5">
        <View className="flex bg-primary rounded-full justify-center items-center p-1">
          <ChevronRight
            className="color-secondary rotate-180"
            size={20}
            onPress={() => updateWeek(-1)}
          />
        </View>
        <View className="flex-1 flex-row max-w-64 items-center justify-center gap-x-2">
          <Text className="text-primary text-4xl font-medium text-center">
            {currentDate.monthLong}
          </Text>
          <Button variant={"ghost"} size={"icon"} onPress={showDatePicker}>
            <CalendarDays className="color-primary" />
          </Button>
        </View>
        <View className="flex bg-primary rounded-full justify-center items-center p-1">
          <ChevronRight
            className="color-secondary"
            size={20}
            onPress={() => updateWeek(1)}
          />
        </View>
      </View>
      <View className="flex-1 flex-row justify-center items-center gap-x-2">
        {createDateChips()}
      </View>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={currentDate.toJSDate()}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

export default DatePickerWithWeek;
