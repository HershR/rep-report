import { asc } from "drizzle-orm";

import { db } from "@/db/client";
import { appSettings, type AppSettings } from "@/db/schema";

export async function getAppSettings(): Promise<AppSettings | null> {
  const [row] = await db.select().from(appSettings).orderBy(asc(appSettings.createdAt)).limit(1);
  return row ?? null;
}
