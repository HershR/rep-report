import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { AntDesign } from "@expo/vector-icons";
import { DateTime } from "luxon";

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

    return days.map((date) => (
      <TouchableOpacity
        key={date.day}
        className="flex w-[40px] h-[60px] rounded-md justify-center items-center"
        onPress={() => {
          updateDate(date);
        }}
        style={{
          backgroundColor: currentDate.day === date.day ? "#2A2E3C" : "#E5E6EF",
        }}
      >
        <Text
          className="text-center text-md"
          style={{
            color: currentDate.day === date.day ? "#E5E6EF" : "#2A2E3C",
          }}
        >
          {date.weekdayShort}
        </Text>
        <Text
          className="text-center text-xs -my-1"
          style={{
            color: currentDate.day === date.day ? "#E5E6EF" : "#2A2E3C",
          }}
        >
          {date.day < 10 ? `0${date.day}` : date.day}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View className="flex py-5 gap-y-4">
      <View className="flex flex-row justify-center items-center gap-x-5">
        <AntDesign
          name="leftcircle"
          size={24}
          color="#21232f"
          onPress={() => updateWeek(-1)}
        />
        <View className="flex-row pl-10 pr-10 gap-x-2">
          <Text className="text-primary text-4xl font-medium text-center">
            {currentDate.monthLong}
          </Text>
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
      <View className="flex-row flex-nowrap gap-x-3 justify-evenly items-center">
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
