import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Check, Search } from "lucide-react-native";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { Input } from "./ui/input";
import { SelectSeparator } from "./ui/select";
import { ListFilter } from "../lib/icons/ListFilter";
interface Item {
  id: string;
  name: string;
}

interface DropdownProps {
  id: string;
  options: Item[];
  selectedItems: string[];
  placeholder?: string;
  searchQuery?: string;
  onSelect: (value: string | null) => void;
}

const AccordianDropdown = ({
  id,
  options,
  selectedItems,
  placeholder = "Select items",
  searchQuery,
  onSelect,
}: DropdownProps) => {
  if (searchQuery) {
    options = options.filter((x) =>
      x.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  return (
    <AccordionItem value={id} className="flex items-start justify-between">
      <AccordionTrigger>
        <Text className="ml-2">{placeholder}</Text>
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
            key={item.name}
            className={"p-2 w-full flex-row justify-start items-center"}
            onPress={() => onSelect(item.id)}
          >
            <Text>{item.name}</Text>
            {selectedItems.includes(item.id) && (
              <View className="justify-center items-center ml-2">
                <Check
                  size={16}
                  strokeWidth={3}
                  className="text-popover-foreground"
                />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
};

export interface SectionItem {
  id: number;
  name: string;
  type: "single" | "multi";
  items: Item[];
}
interface SelectionDropdownProps {
  sections: SectionItem[];
  selectedItems: string[][];
  onSelect: (id: number, value: string | null) => void;

  onClose?: () => void;
}

export default function SectionedDropdown({
  sections,
  selectedItems,
  onSelect,
  onClose,
}: SelectionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <View className="flex relative">
      <TouchableOpacity
        className="flex flex-row h-10 native:h-12 items-center text-sm justify-between rounded-md border border-input bg-background px-3 py-2 text-muted-foreground"
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text numberOfLines={1}>Filters</Text>
        <ListFilter className="color-primary ml-2" size={18} />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        visible={isOpen}
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPressOut={() => setIsOpen(false)}>
          <View className="flex-1 bg-gray-500/30 justify-center items-center p-8">
            <TouchableWithoutFeedback>
              <View className="flex-1 w-full max-w-sm rounded-md bg-background">
                <>
                  <View className="flex-row items-center mx-2">
                    <Input
                      placeholder={"Search for Filter"}
                      value={searchQuery}
                      onChangeText={(value) => setSearchQuery(value.trim())}
                      className="flex-1 pl-12 border-none border-0"
                    ></Input>
                    <Search className="color-primary absolute left-0 ml-2"></Search>
                  </View>
                  <SelectSeparator className="mx-2" />
                  <ScrollView className="flex-1 px-2 pb-6">
                    <Accordion
                      type="multiple"
                      collapsible
                      defaultValue={[sections[0].name]}
                    >
                      {sections.map((item, index) => (
                        <AccordianDropdown
                          key={item.name}
                          id={item.name}
                          placeholder={item.name}
                          options={item.items}
                          selectedItems={selectedItems[index]}
                          onSelect={(value) => onSelect(item.id, value)}
                          searchQuery={searchQuery}
                        />
                      ))}
                    </Accordion>
                  </ScrollView>
                  <Button
                    className="m-4 max-w-sm"
                    onPress={() => {
                      setIsOpen(false);
                      onClose?.();
                    }}
                  >
                    <Text>Close</Text>
                  </Button>
                </>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
