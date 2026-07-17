import type { ReactNode } from "react";
import { ScrollView, StyleSheet, useColorScheme, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { THEME } from "@/lib/theme";

type CustomScreenProps = {
  children: ReactNode;
  /** When true, content scrolls inside safe area. */
  scroll?: boolean;
  contentContainerStyle?: ViewStyle;
};

/** Matches the old `spacing.md` value; not worth a whole spacing scale for one call site. */
const SCREEN_PADDING = 16;

/**
 * The one legacy layout primitive kept intentionally — RNR has no SafeAreaView+ScrollView
 * equivalent, so this stays as the project's screen wrapper (see UIMigration.md decision #3).
 */
export function CustomScreen({
  children,
  scroll = false,
  contentContainerStyle,
}: CustomScreenProps) {
  const scheme = useColorScheme();
  const colors = THEME[scheme ?? "light"];

  const inner = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.scrollContent,
        { padding: SCREEN_PADDING },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.pad, { padding: SCREEN_PADDING }]}>
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
