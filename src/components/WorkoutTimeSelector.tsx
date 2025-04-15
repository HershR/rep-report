import { TextInput, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";

interface Props {
  defaultTime: string | null;
  onChange: (value: string) => void;
}
const WorkoutTimeSelector = ({ defaultTime, onChange }: Props) => {
  const [hours, setHours] = useState<string | null>(null);
  const [minutes, setMinutes] = useState<string | null>(null);
  const [seconds, setSeconds] = useState<string | null>(null);

  const refHours = useRef<TextInput>(null);
  const refMinutes = useRef<TextInput>(null);
  const refSeconds = useRef<TextInput>(null);
  const pad = (v: string | number) => String(v).padStart(2, "0");
  useEffect(() => {
    if (defaultTime) {
      const [h, m, s] = defaultTime.split(":");
      setHours(pad(h));
      setMinutes(pad(m));
      setSeconds(pad(s));
    }
  }, []);

  useEffect(() => {
    onChange(
      `${pad(hours || "00")}:${pad(minutes || "00")}:${pad(seconds || "00")}`
    );
  }, [hours, minutes, seconds]);

  const handleNumberChange = (
    value: string,
    maxValue: number,
    nextRef: React.RefObject<TextInput> | null
  ) => {
    const num = value.replace(/\D/g, "");
    if (num.length === 0) {
      return null;
    }
    if (num.length === 2) {
      nextRef?.current?.focus();
    }
    return num.toString();
  };

  return (
    <View className="flex-1 justify-center items-center">
      <View className="flex-row w-full justify-center items-center gap-x-2">
        <Input
          ref={refHours}
          className="flex-1 text-center"
          placeholder="HH"
          keyboardType="numeric"
          maxLength={2}
          value={hours?.toString() || ""}
          onChangeText={(text) =>
            setHours(handleNumberChange(text, 99, refMinutes))
          }
        ></Input>
        <Text className="text-xl font-semibold">:</Text>
        <Input
          ref={refMinutes}
          className="flex-1 text-center"
          placeholder="MM"
          keyboardType="numeric"
          maxLength={2}
          value={minutes?.toString() || ""}
          onChangeText={(text) =>
            setMinutes(handleNumberChange(text, 99, refSeconds))
          }
        ></Input>
        <Text className="text-xl font-semibold">:</Text>
        <Input
          ref={refSeconds}
          className="flex-1 text-center"
          placeholder="SS"
          keyboardType="numeric"
          maxLength={2}
          value={seconds?.toString() || ""}
          onChangeText={(text) =>
            setSeconds(handleNumberChange(text, 99, null))
          }
        ></Input>
      </View>
    </View>
  );
};

export default WorkoutTimeSelector;
