import { Timer } from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

type RestTimerBarProps = {
  isResting: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  defaultSeconds: number;
  onStart: (seconds: number) => void;
  onAddTime: (deltaSeconds: number) => void;
  onSkip: () => void;
};

/** M:SS (minutes unpadded, seconds padded) — reads naturally for a short rest. */
function formatRest(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const minutes = Math.floor(clamped / 60);
  const remaining = clamped % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export function RestTimerBar({
  isResting,
  remainingSeconds,
  totalSeconds,
  defaultSeconds,
  onStart,
  onAddTime,
  onSkip,
}: RestTimerBarProps) {
  const insets = useSafeAreaInsets();
  const ratio =
    totalSeconds > 0
      ? Math.min(1, Math.max(0, remainingSeconds / totalSeconds))
      : 0;

  return (
    <View
      className="border-primary/30 bg-card border-t px-4 pt-3"
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      {isResting ? (
        <View className="gap-2">
          <View className="bg-surface-raised h-1 w-full overflow-hidden rounded-full">
            <View
              className="bg-primary h-full rounded-full"
              style={{ width: `${ratio * 100}%` }}
            />
          </View>

          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-2">
              <Icon as={Timer} className="text-primary size-5" />
              <Text variant="numeral" className="text-[22px]">{formatRest(remainingSeconds)}</Text>
            </View>

            <View className="ml-auto flex-row items-center gap-2">
              <Button variant="outline" size="sm" onPress={() => onAddTime(-15)}>
                <Text>-15s</Text>
              </Button>
              <Button variant="outline" size="sm" onPress={() => onAddTime(15)}>
                <Text>+15s</Text>
              </Button>
              <Button variant="ghost" size="sm" onPress={onSkip}>
                <Text>Skip</Text>
              </Button>
            </View>
          </View>
        </View>
      ) : (
        <Button
          variant="outline"
          onPress={() => onStart(defaultSeconds)}
        >
          <Icon as={Timer} className="text-primary size-5" />
          <Text>{`Start rest · ${formatRest(defaultSeconds)}`}</Text>
        </Button>
      )}
    </View>
  );
}
