import type { ReactNode } from "react";
import { Text, type TextProps, type TextStyle } from "react-native";

import { typographyVariants, useThemeColors, type TextVariant } from "@/theme";

type CustomTextProps = TextProps & {
  variant?: TextVariant;
  muted?: boolean;
  children: ReactNode;
};

export function CustomText({
  variant = "body",
  muted = false,
  style,
  children,
  ...rest
}: CustomTextProps) {
  const colors = useThemeColors();
  const base = typographyVariants[variant];
  const colorStyle: TextStyle = {
    color: muted ? colors.textMuted : colors.text,
  };

  return (
    <Text style={[base, colorStyle, style]} {...rest}>
      {children}
    </Text>
  );
}
