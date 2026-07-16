import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { CustomText } from "./CustomText";
import { spacing, useThemeColors } from "@/theme";

type CustomButtonProps = Omit<PressableProps, "children"> & {
  label: string;
  loading?: boolean;
  children?: ReactNode;
};

/** @deprecated Use `Button` from `@/components/ui/button` instead (see UIMigration.md). */
export function CustomButton({
  label,
  loading = false,
  disabled,
  style,
  ...rest
}: CustomButtonProps) {
  const colors = useThemeColors();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={(state: PressableStateCallbackType): StyleProp<ViewStyle> => {
        const userStyle: StyleProp<ViewStyle> =
          typeof style === "function" ? style(state) : style;
        return [
          styles.button,
          {
            backgroundColor: colors.primary,
            opacity: isDisabled ? 0.5 : state.pressed ? 0.9 : 1,
          },
          userStyle,
        ];
      }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors.primaryText} />
      ) : (
        <CustomText
          variant="body"
          style={[styles.label, { color: colors.primaryText }]}
        >
          {label}
        </CustomText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  label: { fontWeight: "600" },
});
