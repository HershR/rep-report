import { migrate } from "drizzle-orm/expo-sqlite/migrator";

import { db } from "@/db/client";
import migrations from "@/db/migrations/migrations.js";
import { seedDefaultAppSettings } from "@/db/seed";

let initPromise: Promise<void> | null = null;

export function initializeDatabase(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await migrate(db, migrations);
      await seedDefaultAppSettings();
    })();
  }
  return initPromise;
}
