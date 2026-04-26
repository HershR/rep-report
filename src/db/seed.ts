import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { appSettings, type AppSettings } from "@/db/schema";
import { createUuid, nowUtc } from "@/db/utils";

export async function seedDefaultAppSettings(): Promise<AppSettings> {
  const [existing] = await db.select().from(appSettings).limit(1);
  if (existing) return existing;

  const id = createUuid();
  const timestamp = nowUtc();

  await db.insert(appSettings).values({
    id,
    weightUnit: "lb",
    distanceUnit: "mi",
    heightUnit: "in",
    themeMode: "system",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const [created] = await db.select().from(appSettings).where(eq(appSettings.id, id)).limit(1);
  if (!created) throw new Error("Failed seed app settings");
  return created;
}
