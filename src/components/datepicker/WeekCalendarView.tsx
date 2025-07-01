import { Pressable, TouchableOpacity, View } from "react-native";
import React from "react";
import { ChevronRight } from "@/src/lib/icons/ChevronRight";
import { CalendarDays } from "@/src/lib/icons/CalendarDays";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { DateTime } from "luxon";
import { twMerge } from "tailwind-merge";

interface WeekCalendarViewProps {
  initialDate?: string;
  markedDate?: string[];
  onToggleView?: () => void;
  onLeftArrowPress?: () => void;
  onRightArrowPress?: () => void;
  onDayPress?: (date: DateTime) => void;
}

const WeekCalendarView = ({
  initialDate,
  markedDate,
  onToggleView = () => {},
  onLeftArrowPress = () => {},
  onRightArrowPress = () => {},
  onDayPress = () => {},
}: WeekCalendarViewProps) => {
  const [currentDate, setCurrentDate] = React.useState(
    initialDate ? DateTime.fromISO(initialDate) : DateTime.now()
  );
  const createDateChips = () => {
    const days: DateTime[] = [];
    let start = currentDate.startOf("week");
    for (let i = 0; i < 7; i++) {
      days.push(start);
      start = start.plus({ day: 1 });
    }

    return days.map((date) => {
      const bgColor =
        currentDate.day !== date.day ? "bg-secondary" : "bg-primary";
      const textColor =
        currentDate.day !== date.day ? "text-primary" : "text-border";
      return (
        <TouchableOpacity
          key={date.day}
          className={twMerge(
            "flex-1 h-full rounded-full justify-center items-center aspect-1/1",
            bgColor
          )}
          onPress={() => {
            onDayPress(date);
          }}
        >
          <Text className={twMerge("text-center text-lg", textColor)}>
            {date.day < 10 ? `0${date.day}` : date.day}
          </Text>
        </TouchableOpacity>
      );
    });
  };
  return (
    <View className="flex mx-6">
      <View className="flex-row justify-between mx-4">
        <ChevronRight
          className="color-primary rotate-180"
          size={24}
          onPress={() => onLeftArrowPress}
        />
        <TouchableOpacity
          className="flex-row justify-center items-center mx-3 gap-x-4"
          onPress={onToggleView}
        >
          <Text className="text-2xl font-medium">
            {currentDate.toFormat("LLL yyyy")}
          </Text>
          <CalendarDays className="color-primary" size={26} />
        </TouchableOpacity>
        <ChevronRight
          className="color-primary"
          size={24}
          onPress={() => onRightArrowPress}
        />
      </View>
      <View className="flex-row w-full h-10 justify-center items-center gap-x-2">
        <Text className="flex-1 text-base text-center">Mon</Text>
        <Text className="flex-1 text-base text-center">Tue</Text>
        <Text className="flex-1 text-base text-center">Wed</Text>
        <Text className="flex-1 text-base text-center">Thr</Text>
        <Text className="flex-1 text-base text-center">Fri</Text>
        <Text className="flex-1 text-base text-center">Sat</Text>
        <Text className="flex-1 text-base text-center">Sun</Text>
      </View>
      <View className="h-14 flex-row justify-center items-center gap-x-2">
        {createDateChips()}
      </View>
    </View>
  );
};

export default WeekCalendarView;
