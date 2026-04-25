import { StyleSheet, View } from "react-native";

import { CustomCard, CustomScreen, CustomText } from "@/components/common";
import { spacing } from "@/theme";

export default function SavedScreen() {
  return (
    <CustomScreen scroll>
      <CustomText variant="title">Saved</CustomText>
      <CustomText muted style={styles.subtitle}>
        Favorite exercises and templates — Stage 4.
      </CustomText>
      <View style={styles.gap}>
        <CustomCard>
          <CustomText>
            Saved exercises and workout templates will be listed here, backed by
            SQLite.
          </CustomText>
        </CustomCard>
      </View>
    </CustomScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: spacing.xs },
  gap: { marginTop: spacing.lg },
});
