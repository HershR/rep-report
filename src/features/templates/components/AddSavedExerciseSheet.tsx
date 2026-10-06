import { FlashList } from "@shopify/flash-list";
import { Plus } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { EmptyState } from "@/components/common";
import { Icon } from "@/components/ui/icon";
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
          <SheetTitle>Add saved exercise</SheetTitle>
        </SheetHeader>

        {favorites.length === 0 ? (
          <EmptyState message="No saved exercises yet. Save some from Search, or create your own from the Saved tab." />
        ) : (
          <View className="h-96">
            <FlashList
              data={favorites}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  role="button"
                  accessibilityLabel={`Add ${item.name}`}
                  className="border-separator h-14 flex-row items-center gap-3 border-b active:opacity-80"
                  onPress={() => onAddExercise(item)}
                >
                  <View className="flex-1 gap-1">
                    <Text variant="itemTitle" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text variant="microLabel" numberOfLines={1}>
                      {(item.category || "Uncategorized").toUpperCase()}
                    </Text>
                  </View>
                  <Icon as={Plus} className="text-primary size-5" />
                </Pressable>
              )}
            />
          </View>
        )}
      </SheetContent>
    </Sheet>
  );
}
