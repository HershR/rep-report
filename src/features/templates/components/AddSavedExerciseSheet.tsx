import { FlashList } from "@shopify/flash-list";
import { Pressable, View } from "react-native";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";
import type { Exercise } from "@/features/exercises/types";

type AddSavedExerciseSheetProps = {
  visible: boolean;
  favorites: Exercise[];
  onClose: () => void;
  onAddExercise: (exercise: Exercise) => void;
};

export function AddSavedExerciseSheet({
  visible,
  favorites,
  onClose,
  onAddExercise,
}: AddSavedExerciseSheetProps) {
  return (
    <Sheet open={visible} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Saved Exercise</SheetTitle>
        </SheetHeader>

        {favorites.length === 0 ? (
          <Text variant="muted">No saved exercises available.</Text>
        ) : (
          <View className="h-96">
            <FlashList
              data={favorites}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  className="border-border bg-card active:bg-accent mb-2 flex-row items-center justify-between rounded-md border p-3"
                  onPress={() => onAddExercise(item)}
                >
                  <Text>{item.name}</Text>
                  <Text variant="muted">Add</Text>
                </Pressable>
              )}
            />
          </View>
        )}
      </SheetContent>
    </Sheet>
  );
}
