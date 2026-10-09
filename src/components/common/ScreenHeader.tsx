import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

type ScreenHeaderProps = {
  title: string;
  /** Optional trailing controls, right-aligned on the title row. */
  right?: ReactNode;
};

/**
 * In-screen back header for pushed routes. The app hides native headers globally
 * (`headerShown: false` in the root Stack), so pushed pages render their own back
 * affordance here rather than relying only on the OS swipe-back gesture.
 */
export function ScreenHeader({ title, right }: ScreenHeaderProps) {
  return (
    // The rule belongs on this row, not on the title: `Text` sizes to its
    // content, so a border there stops at the last letter instead of running
    // the width of the screen.
    <View className="border-border flex-row items-center gap-2 border-b pb-2">
      <BackButton />
      <Text variant="screenTitle" numberOfLines={1} className="flex-1">
        {title}
      </Text>
      {right}
    </View>
  );
}

function BackButton() {
  const router = useRouter();

  return (
    <Pressable
      className="-ml-2 rounded-full p-2 active:opacity-70"
      hitSlop={8}
      accessibilityLabel="Back"
      role="button"
      onPress={() => router.back()}
    >
      <Icon as={ChevronLeft} className="text-foreground size-6" />
    </Pressable>
  );
}
