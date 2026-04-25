import { StyleSheet, View } from "react-native";

import { CustomCard, CustomScreen, CustomText } from "@/components/common";
import { spacing } from "@/theme";

export default function SearchScreen() {
  return (
    <CustomScreen scroll>
      <CustomText variant="title">Search</CustomText>
      <CustomText muted style={styles.subtitle}>
        Find exercises from WGER — Stage 3.
      </CustomText>
      <View style={styles.gap}>
        <CustomCard>
          <CustomText>
            Search and filters will live here. For now, use the other tabs to
            explore the shell.
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
