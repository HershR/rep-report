import type { DistanceUnit } from "@/db/schema";

const KM_PER_MILE = 1.609344;

export function toMetricDistance(value: number, unit: DistanceUnit): number {
  return unit === "mi" ? value * KM_PER_MILE : value;
}

export function toDisplayDistance(valueInKm: number, unit: DistanceUnit): number {
  return unit === "mi" ? valueInKm / KM_PER_MILE : valueInKm;
}

export function distanceToText(valueInKm: number | null, unit: DistanceUnit): string {
  if (valueInKm === null) return "";
  return String(Number(toDisplayDistance(valueInKm, unit).toFixed(2)));
}

export function textToMetricDistance(text: string, unit: DistanceUnit): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? toMetricDistance(parsed, unit) : null;
}
