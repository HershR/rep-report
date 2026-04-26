import { asc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { createUuid, nowUtc } from "@/db/utils";
import { measurements, type Measurement } from "@/db/schema";

export async function createMeasurement(input: {
  measurementType: string;
  value: number;
  unit: string;
  measuredAt?: string;
  notes?: string | null;
}): Promise<Measurement> {
  const id = createUuid();
  const timestamp = nowUtc();

  await db.insert(measurements).values({
    id,
    measurementType: input.measurementType,
    value: input.value,
    unit: input.unit,
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
  return row ?? null;
}

export async function listMeasurements(measurementType?: string): Promise<Measurement[]> {
  if (!measurementType) {
    return db.select().from(measurements).orderBy(asc(measurements.measuredAt));
  }

  return db
    .select()
    .from(measurements)
    .where(eq(measurements.measurementType, measurementType))
    .orderBy(asc(measurements.measuredAt));
}
