import { Image as ExpoImage } from "expo-image";
import { Bookmark, Dumbbell } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { ExerciseSource } from "@/db/schema";

type ExerciseRowProps = {
  name: string;
  category?: string | null;
  imageUrl?: string | null;
  isFavorite: boolean;
  source?: ExerciseSource;
  onPress: () => void;
  onToggleFavorite?: () => void;
};

/**
 * A hairline-separated list row, not a card. Nested card borders read as
 * noise on the dark ground; a single separator carries the same grouping
 * for a fraction of the visual weight.
 */
export function ExerciseRow({
  name,
  category,
  imageUrl,
  isFavorite,
  source,
  onPress,
  onToggleFavorite,
}: ExerciseRowProps) {
  const isCustom = source === "custom";
  const meta = [category || "Uncategorized", isCustom ? "CUSTOM" : null]
    .filter(Boolean)
    .join(" · ")
    .toUpperCase();

  return (
    <Pressable
      className="border-separator h-[68px] flex-row items-center gap-3 border-b pr-1 pl-5 active:opacity-80"
      onPress={onPress}
    >
      <View
        className={cn(
          "size-[50px] items-center justify-center overflow-hidden rounded-md",
          imageUrl ? "bg-neutral-200" : "bg-surface-raised",
        )}
      >
        {imageUrl ? (
          <ExpoImage
            source={{ uri: imageUrl }}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
          />
        ) : (
          <Icon as={Dumbbell} className="text-text-4 size-6" />
        )}
      </View>

      <View className="flex-1 gap-1">
        <Text variant="itemTitle" numberOfLines={1}>
          {name}
        </Text>
        <Text variant="microLabel" numberOfLines={1}>
          {meta}
        </Text>
      </View>

      {isCustom ? null : (
        <Button
          variant="ghost"
          size="icon"
          className={cn("size-11 rounded-full", isFavorite && "bg-primary/10")}
          accessibilityLabel={isFavorite ? "Remove from saved" : "Save exercise"}
          onPress={onToggleFavorite}
        >
          <Icon
            as={Bookmark}
            className={isFavorite ? "text-primary" : "text-text-4"}
            fill={isFavorite ? "currentColor" : "none"}
          />
        </Button>
      )}
    </Pressable>
  );
}
