import { ScrollView, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";
import type { ExerciseFilterOption } from "@/features/exercises/types";

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

function FilterSection({
  title,
  options,
  selectedIds,
  onToggle,
}: {
  title: string;
  options: ExerciseFilterOption[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}) {
  if (options.length === 0) return null;

  return (
    <View className="gap-2">
      <Text variant="muted">{title}</Text>
      <View className="gap-1">
        {options.map((option) => {
          const checked = selectedIds.includes(option.id);
          return (
            <Label
              key={option.id}
              onPress={() => onToggle(option.id)}
              className="flex-row items-center justify-between rounded-md p-2"
            >
              <Text className="font-normal">{option.name}</Text>
              <Checkbox checked={checked} onCheckedChange={() => {}} pointerEvents="none" />
            </Label>
          );
        })}
      </View>
    </View>
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
    <Sheet open={visible} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <SheetContent>
        <SheetHeader className="flex-row items-center justify-between">
          <SheetTitle>Filters</SheetTitle>
          <Button variant="ghost" size="sm" onPress={onClearAll}>
            <Text>Clear</Text>
          </Button>
        </SheetHeader>

        <ScrollView className="gap-4">
          <View className="gap-4">
            <FilterSection
              title="Categories"
              options={categoryOptions}
              selectedIds={selectedCategoryIds}
              onToggle={onToggleCategory}
            />
            <FilterSection
              title="Equipment"
              options={equipmentOptions}
              selectedIds={selectedEquipmentIds}
              onToggle={onToggleEquipment}
            />
            <FilterSection
              title="Muscles"
              options={muscleOptions}
              selectedIds={selectedMuscleIds}
              onToggle={onToggleMuscle}
            />
          </View>
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
