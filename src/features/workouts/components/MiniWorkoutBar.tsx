import { useRouter } from "expo-router";
import { ChevronUp, Dumbbell } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  formatElapsed,
  useElapsedSeconds,
} from "@/features/workouts/hooks/useElapsedSeconds";
import { useActiveWorkout } from "@/features/workouts/hooks/useActiveWorkout";

/**
 * Collapsed representation of an in-progress workout, pinned just above the
 * bottom tab bar (see `(tabs)/_layout.tsx`). Only rendered inside the tabs
 * navigator, so it never appears on nested stack screens. Tapping it re-opens
 * the active-workout modal.
 */
export function MiniWorkoutBar() {
  const router = useRouter();
  const { activeWorkout } = useActiveWorkout();
  const elapsed = useElapsedSeconds(activeWorkout?.startedAt);

  if (!activeWorkout || activeWorkout.status !== "active") return null;

  return (
    <Pressable
      accessibilityLabel="Resume workout"
      className="border-border bg-card border-t px-4 py-3 active:opacity-80"
      onPress={() =>
        router.navigate({
          pathname: "/workout/active",
          params: { sessionId: activeWorkout.id },
        })
      }
    >
      <View className="flex-row items-center gap-3">
        <Icon as={Dumbbell} className="text-primary" size={20} />
        <View className="flex-1">
          <Text numberOfLines={1} className="font-medium">
            {activeWorkout.name}
          </Text>
          <Text variant="muted" className="text-xs">
            {`In progress · ${formatElapsed(elapsed)}`}
          </Text>
        </View>
        <Icon as={ChevronUp} className="text-muted-foreground" size={20} />
      </View>
    </Pressable>
  );
}
