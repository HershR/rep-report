import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

type ScreenHeaderProps = {
  title: string;
};

/**
 * In-screen back header for pushed routes. The app hides native headers globally
 * (`headerShown: false` in the root Stack), so pushed pages render their own back
 * affordance here rather than relying only on the OS swipe-back gesture.
 */
export function ScreenHeader({ title }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center gap-2">
      <Pressable
        className="-ml-2 rounded-full p-2 active:opacity-70"
        hitSlop={8}
        onPress={() => router.back()}
      >
        <Icon as={ChevronLeft} className="text-foreground size-6" />
      </Pressable>
      <Text variant="h2">{title}</Text>
    </View>
  );
}
