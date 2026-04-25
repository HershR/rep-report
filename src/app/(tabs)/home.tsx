import { StyleSheet, View } from "react-native";

import {
  CustomButton,
  CustomCard,
  CustomScreen,
  CustomText,
} from "@/components/common";
import { spacing } from "@/theme";

export default function HomeScreen() {
  return (
    <CustomScreen scroll>
      <CustomText variant="title">Home</CustomText>
      <CustomText muted style={styles.subtitle}>
        Your workout hub — more here in later stages.
      </CustomText>
      <View style={styles.gap}>
        <CustomCard>
          <CustomText variant="caption" muted>
            Quick start and recent activity will show up here.
          </CustomText>
        </CustomCard>
        <CustomButton label="Start workout (coming soon)" disabled />
      </View>
    </CustomScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: spacing.xs },
  gap: { marginTop: spacing.lg, gap: spacing.md },
});
