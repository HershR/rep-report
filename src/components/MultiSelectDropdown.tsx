import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronDown } from "../lib/icons/ChevronDown";
import { Check } from "lucide-react-native";

interface Item {
  value: string;
  label: string;
}

interface Props {
  options: Item[];
  selectedItems: string[];
  placeholder?: string;
  onSelect: (value: string | null) => void;
}

const MultiSelectDropdown = ({
  options,
  selectedItems,
  placeholder = "Select items",
  onSelect,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className="flex">
      <TouchableOpacity
        className="flex flex-row h-10 native:h-12 items-center text-sm justify-between rounded-md border border-input bg-background px-3 py-2 text-muted-foreground"
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text numberOfLines={1}>
          {selectedItems.length > 0
            ? options
                .filter((x) => selectedItems.includes(x.value))
                .map((x) => x.label)
                .join(", ")
            : placeholder}
        </Text>
        <ChevronDown
          size={16}
          aria-hidden={true}
          className="text-foreground opacity-50 ml-1"
        />
      </TouchableOpacity>

      {isOpen && (
        <View className="absolute w-full top-10 native:top-12 z-50 min-w-[8rem] rounded-md border border-border bg-popover shadow-md shadow-foreground/10 py-2 px-1">
          <TouchableOpacity
            className={`p-2 `}
            onPress={() => {
              onSelect(null);
              setIsOpen(false);
            }}
          >
            <Text>{"None"}</Text>
          </TouchableOpacity>
          {options.map((item) => (
            <TouchableOpacity
              key={item.value}
              className={`p-2 flex-row justify-between ${
                selectedItems.includes(item.value) ? "bg-gray-100" : ""
              }`}
              onPress={() => onSelect(item.value)}
            >
              <Text>{item.label}</Text>
              {selectedItems.includes(item.value) && (
                <Check
                  size={16}
                  strokeWidth={3}
                  className="text-popover-foreground"
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default MultiSelectDropdown;
