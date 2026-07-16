import type { TextStyle } from "react-native";

export type TextVariant = "title" | "body" | "caption";

const base: TextStyle = {
  color: "inherit",
};

export const typographyVariants: Record<TextVariant, TextStyle> = {
  title: {
    ...base,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
  },
  body: {
    ...base,
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 22,
  },
  caption: {
    ...base,
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
  },
};
