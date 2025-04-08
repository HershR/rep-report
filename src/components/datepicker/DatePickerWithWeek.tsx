import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { AntDesign } from "@expo/vector-icons";
import { DateTime } from "luxon";
import { Button } from "../ui/button";
import { Text as TextR } from "~/components/ui/text";
import { CircleArrowRight } from "@/src/lib/icons/ArrowRight";
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
      const bgColor = currentDate.day !== date.day ? "bg-border" : "bg-primary";
      const textColor =
        currentDate.day !== date.day ? "text-primary" : "text-border";
      return (
        <TouchableOpacity
          key={date.day}
          className={`flex-1 rounded-md justify-center items-center ${bgColor}`}
          onPress={() => {
            updateDate(date);
          }}
        >
          <TextR className={`bg-none text-center text-md ${textColor}`}>
            {date.weekdayShort}
          </TextR>
          <TextR className={`bg-none text-center text-xs -my-1 ${textColor}`}>
            {date.day < 10 ? `0${date.day}` : date.day}
          </TextR>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View className="flex-1 justify-center items-center">
      <View className="flex-1 flex-row justify-center items-center gap-x-5 my-2">
        <AntDesign
          name="leftcircle"
          size={24}
          color="#21232f"
          onPress={() => updateWeek(-1)}
        />
        <View className="flex-row pl-10 pr-10 gap-x-2">
          <TextR className="text-primary text-4xl font-medium text-center">
            {currentDate.monthLong}
          </TextR>
          <AntDesign
            name="calendar"
            size={30}
            color="#21232f"
            onPress={showDatePicker}
          />
        </View>
        <AntDesign
          name="rightcircle"
          size={24}
          color="#21232f"
          onPress={() => updateWeek(1)}
        />
      </View>
      <View className="flex-1 flex-row max-h-16 gap-x-2">
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
