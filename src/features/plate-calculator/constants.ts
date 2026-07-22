import type { WeightUnit } from "@/db/schema";

export type BarPreset = { label: string; weight: number };

/** Standard plate denominations per display unit, descending. */
export const PLATE_SIZES: Record<WeightUnit, number[]> = {
  kg: [25, 20, 15, 10, 5, 2.5, 1.25],
  lb: [45, 35, 25, 10, 5, 2.5],
};

/** Bar presets per display unit; the first entry is the default. */
export const BAR_PRESETS: Record<WeightUnit, BarPreset[]> = {
  kg: [
    { label: "Olympic", weight: 20 },
    { label: "Women's", weight: 15 },
    { label: "None", weight: 0 },
  ],
  lb: [
    { label: "Olympic", weight: 45 },
    { label: "Women's", weight: 35 },
    { label: "None", weight: 0 },
  ],
};

/**
 * Fixed per-denomination plate colors — deliberately NOT the theme `chartN`
 * tokens (those diverge between light/dark). Each plate is rendered with a
 * `border-border` outline so these mid-tone hues read on either theme.
 */
export const PLATE_COLORS: Record<string, string> = {
  // kg
  "kg:25": "#ef4444",
  "kg:20": "#3b82f6",
  "kg:15": "#f59e0b",
  "kg:10": "#10b981",
  "kg:5": "#8b5cf6",
  "kg:2.5": "#ec4899",
  "kg:1.25": "#64748b",
  // lb
  "lb:45": "#3b82f6",
  "lb:35": "#f59e0b",
  "lb:25": "#10b981",
  "lb:10": "#64748b",
  "lb:5": "#8b5cf6",
  "lb:2.5": "#ec4899",
};

export function plateColor(unit: WeightUnit, size: number): string {
  return PLATE_COLORS[`${unit}:${size}`] ?? "#64748b";
}
