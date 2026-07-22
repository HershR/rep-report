import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

type MeasurementEntryFormProps = {
  placeholder: string;
  isAdding?: boolean;
  onAdd: (rawText: string) => void;
};

export function MeasurementEntryForm({
  placeholder,
  isAdding = false,
  onAdd,
}: MeasurementEntryFormProps) {
  const [value, setValue] = useState("");

  const onPressAdd = () => {
    if (!value.trim()) return;
    onAdd(value);
    setValue("");
  };

  return (
    <View className="flex-row items-center gap-2">
      <Input
        className="flex-1"
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        keyboardType="decimal-pad"
      />
      <Button loading={isAdding} onPress={onPressAdd}>
        <Text>Add</Text>
      </Button>
    </View>
  );
}
