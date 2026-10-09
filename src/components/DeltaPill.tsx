import { ArrowDown, ArrowUp } from "lucide-react-native";
import { View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type DeltaPillProps = {
  /** Signed change. Zero renders nothing — "no change" is not news. */
  value: number;
  /** Renders the magnitude; this component supplies the sign and the arrow. */
  format?: (magnitude: number) => string;
  /** The pill shows only a number, so say what it is compared against. */
  accessibilityLabel?: string;
};

/**
 * The lime "+1" chip from the mockups: a signed change against the period
 * before. Shared so the weekly card and the volume hero cannot drift apart.
 */
export function DeltaPill({
  value,
  format,
  accessibilityLabel,
}: DeltaPillProps) {
  if (!Number.isFinite(value) || value === 0) return null;

  const isUp = value > 0;
  const magnitude = Math.abs(value);

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      className={cn(
        "flex-row items-center gap-1 rounded-full px-2.5 py-1.5",
        isUp ? "bg-primary/10" : "bg-surface-raised",
      )}
    >
      <Icon
        as={isUp ? ArrowUp : ArrowDown}
        className={cn("size-3", isUp ? "text-primary" : "text-text-3")}
      />
      <Text variant="meta" className={isUp ? "text-primary" : "text-text-3"}>
        {`${isUp ? "+" : "−"}${format ? format(magnitude) : magnitude}`}
      </Text>
    </View>
  );
}
