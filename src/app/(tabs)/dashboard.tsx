import { StyleSheet, View } from "react-native";

import { CustomCard, CustomScreen, CustomText } from "@/components/common";
import { spacing } from "@/theme";

export default function DashboardScreen() {
  return (
    <CustomScreen scroll>
      <CustomText variant="title">Dashboard</CustomText>
      <CustomText muted style={styles.subtitle}>
        History and stats — Stage 6.
      </CustomText>
      <View style={styles.gap}>
        <CustomCard>
          <CustomText>
            Calendar and completed workouts will appear here after the workout
            flow is built.
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
