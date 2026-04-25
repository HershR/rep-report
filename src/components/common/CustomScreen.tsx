import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { spacing, useThemeColors } from "@/theme";

type CustomScreenProps = {
  children: ReactNode;
  /** When true, content scrolls inside safe area. */
  scroll?: boolean;
  contentContainerStyle?: ViewStyle;
};

export function CustomScreen({
  children,
  scroll = false,
  contentContainerStyle,
}: CustomScreenProps) {
  const colors = useThemeColors();

  const inner = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.scrollContent,
        { padding: spacing.md },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.pad, { padding: spacing.md }]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      {inner}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});
