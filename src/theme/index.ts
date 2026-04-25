import { useColorScheme } from "react-native";

import { getColors, type ColorScheme, type ThemeColors } from "./colors";
import { spacing } from "./spacing";
import { typographyVariants, type TextVariant } from "./typography";

export { spacing, typographyVariants, type TextVariant };
export type { ColorScheme, ThemeColors };
export { getColors };

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return getColors(scheme);
}
