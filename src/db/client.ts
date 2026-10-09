import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

import * as schema from "@/db/schema";

export const sqlite = openDatabaseSync("rep-report.db");
sqlite.execSync("PRAGMA foreign_keys = ON;");
export const db = drizzle(sqlite, { schema });

export type Database = typeof db;
