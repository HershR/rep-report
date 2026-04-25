import { StyleSheet, View } from "react-native";

import { CustomCard, CustomScreen, CustomText } from "@/components/common";
import { spacing } from "@/theme";

export default function ProfileScreen() {
  return (
    <CustomScreen scroll>
      <CustomText variant="title">Profile</CustomText>
      <CustomText muted style={styles.subtitle}>
        You and measurements — Stage 7.
      </CustomText>
      <View style={styles.gap}>
        <CustomCard>
          <CustomText>
            Profile fields and measurement history will be added after the
            database layer is ready.
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
