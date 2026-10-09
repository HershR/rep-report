import type { DistanceUnit, HeightUnit, WeightUnit } from "@/db/schema";

const KM_PER_MILE = 1.609344;
const KG_PER_LB = 0.45359237;
const CM_PER_INCH = 2.54;

export function toMetricDistance(value: number, unit: DistanceUnit): number {
  return unit === "mi" ? value * KM_PER_MILE : value;
}

export function toDisplayDistance(
  valueInKm: number,
  unit: DistanceUnit,
): number {
  return unit === "mi" ? valueInKm / KM_PER_MILE : valueInKm;
}

export function distanceToText(
  valueInKm: number | null,
  unit: DistanceUnit,
): string {
  if (valueInKm === null) return "";
  return String(Number(toDisplayDistance(valueInKm, unit).toFixed(2)));
}

export function textToMetricDistance(
  text: string,
  unit: DistanceUnit,
): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? toMetricDistance(parsed, unit) : null;
}

export function toMetricWeight(value: number, unit: WeightUnit): number {
  return unit === "lb" ? value * KG_PER_LB : value;
}

export function toDisplayWeight(valueInKg: number, unit: WeightUnit): number {
  return unit === "lb" ? valueInKg / KG_PER_LB : valueInKg;
}

export function weightToText(
  valueInKg: number | null,
  unit: WeightUnit,
): string {
  if (valueInKg === null) return "";
  return String(Number(toDisplayWeight(valueInKg, unit).toFixed(2)));
}

export function textToMetricWeight(
  text: string,
  unit: WeightUnit,
): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? toMetricWeight(parsed, unit) : null;
}

export function toMetricHeight(value: number, unit: HeightUnit): number {
  return unit === "in" ? value * CM_PER_INCH : value;
}

export function toDisplayHeightCm(
  valueInCm: number,
  heightUnit: HeightUnit,
): string {
  if (heightUnit === "in") {
    const totalInches = valueInCm / CM_PER_INCH;
    const feet = Math.floor(totalInches / 12);
    const inches = Number((totalInches - feet * 12).toFixed(1));
    return `${feet} ft ${inches} in`;
  }
  return `${Number(valueInCm.toFixed(2))} cm`;
}

/**
 * Plain decimal cm/in for single-number length measurements (e.g. circumferences)
 * — unlike toDisplayHeightCm, never splits into feet+inches.
 */
export function toDisplayLengthCm(
  valueInCm: number,
  unit: HeightUnit,
): number {
  return unit === "in" ? valueInCm / CM_PER_INCH : valueInCm;
}

export function lengthToText(
  valueInCm: number | null,
  unit: HeightUnit,
): string {
  if (valueInCm === null) return "";
  return String(Number(toDisplayLengthCm(valueInCm, unit).toFixed(2)));
}

export function textToMetricLength(
  text: string,
  unit: HeightUnit,
): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? toMetricHeight(parsed, unit) : null;
}

/**
 * Display text is rounded to two decimals, so parsing it back is lossy: 60 kg
 * shown in lb reads "132.28", which parses to 60.0004 kg. If committed text is
 * numerically what one of `known` displays as - the field was left untouched,
 * or a value was copied from another set - that canonical value is returned
 * unchanged, so viewing data in another unit never rewrites it. Only genuinely
 * new input is parsed.
 */
function resolveText(
  text: string,
  known: readonly (number | null)[],
  toText: (canonical: number) => string,
  parse: (text: string) => number | null,
): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const entered = Number(trimmed);
  for (const value of known) {
    if (value !== null && Number(toText(value)) === entered) return value;
  }
  return parse(trimmed);
}

/** Canonical kg for committed weight text. See `resolveText`. */
export function resolveWeightText(
  text: string,
  unit: WeightUnit,
  knownKg: readonly (number | null)[] = [],
): number | null {
  return resolveText(
    text,
    knownKg,
    (kg) => weightToText(kg, unit),
    (value) => textToMetricWeight(value, unit),
  );
}

/** Canonical km for committed distance text. See `resolveText`. */
export function resolveDistanceText(
  text: string,
  unit: DistanceUnit,
  knownKm: readonly (number | null)[] = [],
): number | null {
  return resolveText(
    text,
    knownKm,
    (km) => distanceToText(km, unit),
    (value) => textToMetricDistance(value, unit),
  );
}

/** Canonical cm for committed length text. See `resolveText`. */
export function resolveLengthText(
  text: string,
  unit: HeightUnit,
  knownCm: readonly (number | null)[] = [],
): number | null {
  return resolveText(
    text,
    knownCm,
    (cm) => lengthToText(cm, unit),
    (value) => textToMetricLength(value, unit),
  );
}
