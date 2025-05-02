import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { ChevronDown } from "../lib/icons/ChevronDown";
import { Check } from "lucide-react-native";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";
import { Text } from "./ui/text";

interface Item {
  value: string;
  label: string;
}

interface DropdownProps {
  id: string;
  options: Item[];
  selectedItems: string[];
  placeholder?: string;
  onSelect: (value: string | null) => void;
}

const AccordianDropdown = ({
  id,
  options,
  selectedItems,
  placeholder = "Select items",
  onSelect,
}: DropdownProps) => {
  return (
    <AccordionItem value={id}>
      <AccordionTrigger>
        <Text>{placeholder}</Text>
      </AccordionTrigger>
      <AccordionContent className="items-start w-full">
        <TouchableOpacity
          className={`p-2 `}
          onPress={() => {
            onSelect(null);
          }}
        >
          <Text>{"None"}</Text>
        </TouchableOpacity>
        {options.map((item) => (
          <TouchableOpacity
            key={item.label}
            className={`p-2 flex-row justify-between ${
              selectedItems.includes(item.value) ? "bg-gray-300" : ""
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
      </AccordionContent>
    </AccordionItem>
  );
};

interface SectionItem {
  name: string;
  type: "single" | "multi";
  items: Item[];
  onSelect: (value: string | null) => void;
}
interface SelectionDropdownProps {
  sections: SectionItem[];
  selectedItems: string[][];
}

export default function SectionedDropdown({
  sections,
  selectedItems,
}: SelectionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <View className="flex relative">
      <TouchableOpacity
        className="flex flex-row h-10 native:h-12 items-center text-sm justify-between rounded-md border border-input bg-background px-3 py-2 text-muted-foreground"
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text numberOfLines={1}>Filters</Text>
        <ChevronDown
          size={16}
          aria-hidden={true}
          className="text-foreground opacity-50 ml-1"
        />
      </TouchableOpacity>
      {isOpen && (
        <View className="absolute top-10 right-0 native:top-12 z-50 min-w-60 rounded-md border border-border bg-popover shadow-md shadow-foreground/10 py-2 px-1">
          <Accordion type="multiple" collapsible defaultValue={[]}>
            {sections.map((item, index) => (
              <AccordianDropdown
                key={`item-${index}`}
                id={`item-${index}`}
                placeholder={item.name}
                options={item.items}
                selectedItems={selectedItems[index]}
                onSelect={item.onSelect}
              />
            ))}
            <Button>
              <Text>Confirm</Text>
            </Button>
          </Accordion>
        </View>
      )}
    </View>
  );
}
