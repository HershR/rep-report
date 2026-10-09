import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { createUuid, nowUtc } from "@/db/utils";
import { measurements, type Measurement } from "@/db/schema";
import { toMetricHeight, toMetricWeight } from "@/lib/units";

export const SUPPORTED_MEASUREMENT_TYPES = [
  "weight",
  "height",
  "chest",
  "waist",
  "hips",
  "shoulders",
  "left_arm",
  "right_arm",
  "left_thigh",
  "right_thigh",
] as const;
export type SupportedMeasurementType = (typeof SUPPORTED_MEASUREMENT_TYPES)[number];

function isSupportedType(value: string): value is SupportedMeasurementType {
  return (SUPPORTED_MEASUREMENT_TYPES as readonly string[]).includes(value);
}

/**
 * Measurements are stored canonically like every other quantity: body weight
 * in kg, every length in cm. The `unit` column records which, and is set here
 * rather than by callers.
 */
function canonicalUnitFor(type: SupportedMeasurementType): "kg" | "cm" {
  return type === "weight" ? "kg" : "cm";
}

/**
 * Every row leaves the repository canonical, so no screen ever has to look at
 * `unit`. Migration 0003 converted legacy display-unit rows; this is the guard
 * that keeps a stray one from reaching the UI unconverted.
 */
function toCanonical(row: Measurement): Measurement {
  if (row.unit === "lb") return { ...row, value: toMetricWeight(row.value, "lb"), unit: "kg" };
  if (row.unit === "in") return { ...row, value: toMetricHeight(row.value, "in"), unit: "cm" };
  return row;
}

/** `value` is canonical: kg for weight, cm for every other type. */
export async function createMeasurement(input: {
  measurementType: SupportedMeasurementType;
  value: number;
  measuredAt?: string;
  notes?: string | null;
}): Promise<Measurement> {
  if (!isSupportedType(input.measurementType)) {
    throw new Error("Unsupported measurement type");
  }

  const id = createUuid();
  const timestamp = nowUtc();

  await db.insert(measurements).values({
    id,
    measurementType: input.measurementType,
    value: input.value,
    unit: canonicalUnitFor(input.measurementType),
    measuredAt: input.measuredAt ?? timestamp,
    notes: input.notes ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const created = await getMeasurementById(id);
  if (!created) throw new Error("Failed create measurement");
  return created;
}

export async function getMeasurementById(id: string): Promise<Measurement | null> {
  const [row] = await db.select().from(measurements).where(eq(measurements.id, id)).limit(1);
  return row ? toCanonical(row) : null;
}

export async function listMeasurements(measurementType?: string): Promise<Measurement[]> {
  const type = measurementType ?? "weight";
  if (!isSupportedType(type)) {
    return [];
  }

  const rows = await db
    .select()
    .from(measurements)
    .where(eq(measurements.measurementType, type))
    .orderBy(asc(measurements.measuredAt));
  return rows.map(toCanonical);
}

export async function getLatestMeasurementByType(
  measurementType: SupportedMeasurementType,
): Promise<Measurement | null> {
  const [row] = await db
    .select()
    .from(measurements)
    .where(eq(measurements.measurementType, measurementType))
    .orderBy(desc(measurements.measuredAt))
    .limit(1);
  return row ? toCanonical(row) : null;
}
