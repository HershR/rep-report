export type ColorScheme = "light" | "dark";

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryText: string;
};

const light: ThemeColors = {
  background: "#F5F5F7",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  text: "#1C1C1E",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  primary: "#2563EB",
  primaryText: "#FFFFFF",
};

const dark: ThemeColors = {
  background: "#000000",
  surface: "#1C1C1E",
  surfaceElevated: "#2C2C2E",
  text: "#F5F5F7",
  textMuted: "#9CA3AF",
  border: "#3A3A3C",
  primary: "#3B82F6",
  primaryText: "#FFFFFF",
};

export function getColors(scheme: ColorScheme | null | undefined): ThemeColors {
  return scheme === "dark" ? dark : light;
}
