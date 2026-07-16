import type { ReactNode } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { spacing, useThemeColors } from "@/theme";

type CustomCardProps = ViewProps & {
  children: ReactNode;
};

/** @deprecated Use `Card`/`CardHeader`/`CardContent`/`CardFooter` from `@/components/ui/card` instead (see UIMigration.md). */
export function CustomCard({ style, children, ...rest }: CustomCardProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
});
