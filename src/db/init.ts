import { migrate } from "drizzle-orm/expo-sqlite/migrator";

import { db } from "@/db/client";
import migrations from "@/db/migrations/migrations.js";
import { seedDefaultAppSettings } from "@/db/seed";

let initPromise: Promise<void> | null = null;

/**
 * Runs migrations and seeds default settings, once. Concurrent callers share
 * the in-flight promise so `migrate()` never runs twice at the same time. A
 * failure is not cached: the next call tries again, which is what lets the
 * launch screen offer "Try again".
 */
export function initializeDatabase(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await migrate(db, migrations);
      await seedDefaultAppSettings();
    })().catch((error: unknown) => {
      initPromise = null;
      throw error;
    });
  }
  return initPromise;
}
