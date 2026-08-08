import { useRouter } from "expo-router";
import { ChevronLeft, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type ScreenHeaderProps = {
  /** Page name. Always sits on the left and truncates before actions shrink. */
  title: string;
  /** Sub-pages show a back control immediately left of the title. */
  showBack?: boolean;
  /** Overrides the default `router.back()` (e.g. a modal's dismiss). */
  onBack?: () => void;
  backLabel?: string;
  /** Defaults to a left chevron; modals pass a down chevron. */
  backIcon?: LucideIcon;
  /** Per-page controls, right-aligned. Put the primary action last. */
  children?: ReactNode;
  className?: string;
};

/**
 * The single page header used by every screen.
 *
 * Contract: one row. Optional back control, then the page name on the left,
 * then any per-page actions on the right. The app hides native headers globally
 * (`headerShown: false` in the root Stack), so this is the only header a screen
 * gets and the only place this layout is defined.
 */
export function ScreenHeader({
  title,
  showBack = false,
  onBack,
  backLabel = "Go back",
  backIcon = ChevronLeft,
  children,
  className,
}: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View className={cn("flex-row items-center gap-2", className)}>
      {showBack ? (
        <Button
          variant="ghost"
          size="icon"
          className="-ml-2 h-8 w-8"
          accessibilityLabel={backLabel}
          onPress={onBack ?? (() => router.back())}
        >
          <Icon as={backIcon} className="text-foreground" />
        </Button>
      ) : null}
      <Text variant="h3" numberOfLines={1} className="flex-1">
        {title}
      </Text>
      {children}
    </View>
  );
}
