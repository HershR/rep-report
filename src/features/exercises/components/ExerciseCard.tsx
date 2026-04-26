import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { Image as ExpoImage } from "expo-image";

import { CustomCard, CustomText } from "@/components/common";
import { spacing, useThemeColors } from "@/theme";

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
  const colors = useThemeColors();

  return (
    <CustomCard>
      <Pressable onPress={onPress} style={styles.row}>
        <View style={[styles.imageWrap, { borderColor: colors.border }]}>
          {imageUrl ? (
            <ExpoImage
              source={{ uri: imageUrl }}
              style={styles.image}
              contentFit="contain"
            />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                { backgroundColor: colors.background },
              ]}
            >
              <CustomText muted>IMG</CustomText>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <CustomText>{name}</CustomText>
          <CustomText muted>{category || "Uncategorized"}</CustomText>
        </View>
        <Pressable onPress={onToggleFavorite} hitSlop={8}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={22}
            color={isFavorite ? "#ef4444" : colors.textMuted}
          />
        </Pressable>
      </Pressable>
    </CustomCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  imageWrap: {
    width: 56,
    height: 56,
    borderRadius: spacing.xs,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  favoriteButton: {
    position: "absolute",
    right: spacing.xs,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
});
