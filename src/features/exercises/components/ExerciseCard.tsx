import { Image as ExpoImage } from "expo-image";
import { Heart } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

type ExerciseCardProps = {
  name: string;
  category?: string | null;
  imageUrl?: string | null;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
};

export function ExerciseCard({
  name,
  category,
  imageUrl,
  isFavorite,
  onPress,
  onToggleFavorite,
}: ExerciseCardProps) {
  return (
    <Card className="overflow-hidden p-0">
      <Pressable
        className="flex-row items-center gap-3 p-4 active:opacity-80"
        onPress={onPress}
      >
        <View className="bg-white border-border h-14 w-14 overflow-hidden rounded-md border">
          {imageUrl ? (
            <ExpoImage
              source={{ uri: imageUrl }}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
            />
          ) : (
            <View className="bg-muted h-full w-full items-center justify-center">
              <Text variant="muted">IMG</Text>
            </View>
          )}
        </View>

        <View className="flex-1 gap-0.5">
          <Text>{name}</Text>
          <Text variant="muted">{category || "Uncategorized"}</Text>
        </View>

        <Button variant="ghost" size="icon" onPress={onToggleFavorite}>
          <Icon
            as={Heart}
            className={isFavorite ? "text-red-500" : "text-muted-foreground"}
            fill={isFavorite ? "currentColor" : "none"}
          />
        </Button>
      </Pressable>
    </Card>
  );
}
