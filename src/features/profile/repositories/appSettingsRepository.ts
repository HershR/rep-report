import { asc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { appSettings, type AppSettings } from "@/db/schema";
import { nowUtc } from "@/db/utils";

export async function getAppSettings(): Promise<AppSettings | null> {
  const [row] = await db.select().from(appSettings).orderBy(asc(appSettings.createdAt)).limit(1);
  return row ?? null;
}

export async function updateAppSettings(
  input: Partial<{
    weightUnit: "lb" | "kg";
    distanceUnit: "mi" | "km";
    heightUnit: "in" | "cm";
    themeMode: "system" | "light" | "dark";
  }>,
): Promise<AppSettings | null> {
  const current = await getAppSettings();
  if (!current) return null;

  await db
    .update(appSettings)
    .set({
      ...(input.weightUnit !== undefined ? { weightUnit: input.weightUnit } : {}),
      ...(input.distanceUnit !== undefined ? { distanceUnit: input.distanceUnit } : {}),
      ...(input.heightUnit !== undefined ? { heightUnit: input.heightUnit } : {}),
      ...(input.themeMode !== undefined ? { themeMode: input.themeMode } : {}),
      updatedAt: nowUtc(),
    })
    .where(eq(appSettings.id, current.id));

  return getAppSettings();
}
