import { ChevronRight, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type ListRowProps = {
  label: string;
  icon?: LucideIcon;
  /** Short trailing value, e.g. "lb · in". */
  value?: string;
  /** Replaces the trailing value and chevron, e.g. a switch. */
  trailing?: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  /** Pressable rows get a chevron unless `trailing` is given. */
  onPress?: () => void;
};

/**
 * A hairline-separated full-bleed row - the redesign's list unit for settings,
 * navigation and history. Bleeds to the screen edges with `-mx-4` to cancel
 * CustomScreen's padding, so the separator runs the full width.
 */
export function ListRow({
  label,
  icon,
  value,
  trailing,
  destructive = false,
  disabled = false,
  onPress,
}: ListRowProps) {
  const content = (
    <>
      {icon ? (
        <Icon
          as={icon}
          className={cn("size-5", destructive ? "text-destructive" : "text-text-3")}
        />
      ) : null}
      <Text
        className={cn(
          "flex-1 text-[15px] font-medium",
          destructive && "text-destructive",
        )}
        numberOfLines={1}
      >
        {label}
      </Text>
      {trailing ?? (
        <>
          {value ? (
            <Text variant="meta" className="text-text-3">
              {value}
            </Text>
          ) : null}
          {onPress ? <Icon as={ChevronRight} className="text-text-4 size-4" /> : null}
        </>
      )}
    </>
  );

  const className = cn(
    "border-separator -mx-4 min-h-14 flex-row items-center gap-3 border-b px-4",
    disabled && "opacity-50",
  );

  if (!onPress) return <View className={className}>{content}</View>;
  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      disabled={disabled}
      className={cn(className, "active:opacity-80")}
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}
