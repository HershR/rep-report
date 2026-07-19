import { Pressable, ScrollView, View } from "react-native";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";
import type { ExerciseFilterOption } from "@/features/exercises/types";
import { cn } from "@/lib/utils";

type ExerciseFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  categoryOptions: ExerciseFilterOption[];
  equipmentOptions: ExerciseFilterOption[];
  muscleOptions: ExerciseFilterOption[];
  selectedCategoryIds: number[];
  selectedEquipmentIds: number[];
  selectedMuscleIds: number[];
  onToggleCategory: (id: number) => void;
  onToggleEquipment: (id: number) => void;
  onToggleMuscle: (id: number) => void;
  onClearAll: () => void;
};

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "rounded-full border px-3 py-1.5 active:opacity-80",
        selected ? "border-primary bg-primary" : "border-border bg-transparent",
      )}
    >
      <Text
        className={cn(
          "text-sm",
          selected ? "text-primary-foreground" : "text-foreground",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FilterSection({
  value,
  title,
  options,
  selectedIds,
  onToggle,
}: {
  value: string;
  title: string;
  options: ExerciseFilterOption[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}) {
  if (options.length === 0) return null;

  return (
    <AccordionItem value={value}>
      <AccordionTrigger>{title}</AccordionTrigger>
      <AccordionContent>
        <View className="flex-row flex-wrap gap-2">
          {options.map((option) => (
            <FilterChip
              key={option.id}
              label={option.name}
              selected={selectedIds.includes(option.id)}
              onPress={() => onToggle(option.id)}
            />
          ))}
        </View>
      </AccordionContent>
    </AccordionItem>
  );
}

export function ExerciseFilterModal({
  visible,
  onClose,
  categoryOptions,
  equipmentOptions,
  muscleOptions,
  selectedCategoryIds,
  selectedEquipmentIds,
  selectedMuscleIds,
  onToggleCategory,
  onToggleEquipment,
  onToggleMuscle,
  onClearAll,
}: ExerciseFilterModalProps) {
  return (
    <Sheet
      open={visible}
      onOpenChange={(open) => (!open ? onClose() : undefined)}
    >
      <SheetContent>
        <SheetHeader className="flex-row items-center justify-between">
          <SheetTitle>Filters</SheetTitle>
          <Button variant="ghost" size="sm" onPress={onClearAll}>
            <Text>Clear</Text>
          </Button>
        </SheetHeader>

        <ScrollView className="gap-4">
          <Accordion
            type="multiple"
            collapsible
            defaultValue={["categories", "equipment", "muscles"]}
          >
            <FilterSection
              value="categories"
              title="Categories"
              options={categoryOptions}
              selectedIds={selectedCategoryIds}
              onToggle={onToggleCategory}
            />
            <FilterSection
              value="equipment"
              title="Equipment"
              options={equipmentOptions}
              selectedIds={selectedEquipmentIds}
              onToggle={onToggleEquipment}
            />
            <FilterSection
              value="muscles"
              title="Muscles"
              options={muscleOptions}
              selectedIds={selectedMuscleIds}
              onToggle={onToggleMuscle}
            />
          </Accordion>
        </ScrollView>

        <SheetFooter>
          <Button onPress={onClose}>
            <Text>Done</Text>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
