import { Pressable } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type ChoiceChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

/** A toggleable pill for picking from a set of options (filters, categories). */
export function ChoiceChip({ label, selected, onPress }: ChoiceChipProps) {
  return (
    <Pressable
      role="button"
      accessibilityState={{ selected }}
      hitSlop={2}
      onPress={onPress}
      className={cn(
        "h-10 justify-center rounded-full border px-4 active:opacity-80",
        selected ? "border-primary bg-primary" : "border-border bg-transparent",
      )}
    >
      <Text
        className={cn(
          "text-sm font-medium",
          selected ? "text-primary-foreground" : "text-foreground",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
