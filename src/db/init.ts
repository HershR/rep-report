import { migrate } from "drizzle-orm/expo-sqlite/migrator";

import { db } from "@/db/client";
import migrations from "@/db/migrations/migrations.js";
import { seedDefaultAppSettings } from "@/db/seed";
import { runDatabaseSmokeTest } from "@/db/smokeTest";

let initialized = false;

export async function initializeDatabase(): Promise<void> {
  if (initialized) return;

  await migrate(db, migrations);
  await seedDefaultAppSettings();

  if (__DEV__) {
    await runDatabaseSmokeTest();
  }

  initialized = true;
}
