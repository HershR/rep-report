import { db } from "@/db/client";
import journal from "@/db/migrations/meta/_journal.json";
import {
  appSettings,
  exercises,
  measurements,
  profile,
  workoutSessionExercises,
  workoutSessions,
  workoutSets,
  workoutTemplateExercises,
  workoutTemplateSets,
  workoutTemplates,
} from "@/db/schema";
import { seedDefaultAppSettings } from "@/db/seed";
import { chunk, nowUtc } from "@/db/utils";

/**
 * Whole-database backup for an offline-only app: everything a user has lives
 * in this one SQLite file, so a reinstall without a backup loses it all.
 *
 * A backup records the migration it was taken at, and only a backup from the
 * same schema can be restored - a row shape from another migration would
 * either fail to insert or land with the wrong meaning.
 */

export const BACKUP_FORMAT = "rep-report-backup";
export const BACKUP_VERSION = 1;

const CURRENT_MIGRATION = journal.entries[journal.entries.length - 1].tag;

export type BackupData = {
  exercises: (typeof exercises.$inferSelect)[];
  workoutTemplates: (typeof workoutTemplates.$inferSelect)[];
  workoutTemplateExercises: (typeof workoutTemplateExercises.$inferSelect)[];
  workoutTemplateSets: (typeof workoutTemplateSets.$inferSelect)[];
  workoutSessions: (typeof workoutSessions.$inferSelect)[];
  workoutSessionExercises: (typeof workoutSessionExercises.$inferSelect)[];
  workoutSets: (typeof workoutSets.$inferSelect)[];
  profile: (typeof profile.$inferSelect)[];
  measurements: (typeof measurements.$inferSelect)[];
  appSettings: (typeof appSettings.$inferSelect)[];
};

export type BackupFile = {
  format: typeof BACKUP_FORMAT;
  version: number;
  migration: string;
  exportedAt: string;
  data: BackupData;
};

const TABLE_KEYS: (keyof BackupData)[] = [
  "exercises",
  "workoutTemplates",
  "workoutTemplateExercises",
  "workoutTemplateSets",
  "workoutSessions",
  "workoutSessionExercises",
  "workoutSets",
  "profile",
  "measurements",
  "appSettings",
];

export class BackupFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackupFormatError";
  }
}

export async function exportAllData(): Promise<BackupFile> {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    migration: CURRENT_MIGRATION,
    exportedAt: nowUtc(),
    data: {
      exercises: await db.select().from(exercises),
      workoutTemplates: await db.select().from(workoutTemplates),
      workoutTemplateExercises: await db.select().from(workoutTemplateExercises),
      workoutTemplateSets: await db.select().from(workoutTemplateSets),
      workoutSessions: await db.select().from(workoutSessions),
      workoutSessionExercises: await db.select().from(workoutSessionExercises),
      workoutSets: await db.select().from(workoutSets),
      profile: await db.select().from(profile),
      measurements: await db.select().from(measurements),
      appSettings: await db.select().from(appSettings),
    },
  };
}

/**
 * Checks the envelope of an untrusted backup file. Row contents are left to
 * the database: NOT NULL, foreign keys and the one-active-workout index all
 * reject bad rows inside the restore transaction, which then rolls back.
 */
export function parseBackup(text: string): BackupFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new BackupFormatError("That file isn't a Rep Report backup.");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new BackupFormatError("That file isn't a Rep Report backup.");
  }
  const candidate = parsed as Partial<BackupFile>;
  if (candidate.format !== BACKUP_FORMAT) {
    throw new BackupFormatError("That file isn't a Rep Report backup.");
  }
  if (candidate.version !== BACKUP_VERSION || candidate.migration !== CURRENT_MIGRATION) {
    throw new BackupFormatError(
      "This backup was made by a different version of Rep Report and can't be restored here.",
    );
  }

  const data = candidate.data as Partial<Record<keyof BackupData, unknown>> | undefined;
  if (typeof data !== "object" || data === null) {
    throw new BackupFormatError("This backup is incomplete.");
  }
  for (const key of TABLE_KEYS) {
    const rows = data[key];
    if (!Array.isArray(rows) || !rows.every((row) => typeof row === "object" && row !== null)) {
      throw new BackupFormatError("This backup is incomplete.");
    }
  }
  return candidate as BackupFile;
}

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Children before parents, so `restrict` foreign keys never fire. */
function deleteEverything(tx: Transaction): void {
  tx.delete(workoutSets).run();
  tx.delete(workoutSessionExercises).run();
  tx.delete(workoutSessions).run();
  tx.delete(workoutTemplateSets).run();
  tx.delete(workoutTemplateExercises).run();
  tx.delete(workoutTemplates).run();
  tx.delete(exercises).run();
  tx.delete(measurements).run();
  tx.delete(profile).run();
  tx.delete(appSettings).run();
}

/**
 * Replaces everything on the device with the backup, in one transaction: a
 * row the database rejects rolls the whole restore back, leaving the current
 * data exactly as it was.
 *
 * `db.transaction` on expo-sqlite is synchronous - nothing inside awaits.
 */
export async function importAllData(backup: BackupFile): Promise<void> {
  const { data } = backup;

  db.transaction((tx) => {
    deleteEverything(tx);
    // Parents before children.
    for (const batch of chunk(data.exercises)) tx.insert(exercises).values(batch).run();
    for (const batch of chunk(data.workoutTemplates)) tx.insert(workoutTemplates).values(batch).run();
    for (const batch of chunk(data.workoutTemplateExercises)) {
      tx.insert(workoutTemplateExercises).values(batch).run();
    }
    for (const batch of chunk(data.workoutTemplateSets)) tx.insert(workoutTemplateSets).values(batch).run();
    for (const batch of chunk(data.workoutSessions)) tx.insert(workoutSessions).values(batch).run();
    for (const batch of chunk(data.workoutSessionExercises)) {
      tx.insert(workoutSessionExercises).values(batch).run();
    }
    for (const batch of chunk(data.workoutSets)) tx.insert(workoutSets).values(batch).run();
    for (const batch of chunk(data.profile)) tx.insert(profile).values(batch).run();
    for (const batch of chunk(data.measurements)) tx.insert(measurements).values(batch).run();
    for (const batch of chunk(data.appSettings)) tx.insert(appSettings).values(batch).run();
  });

  // A backup without settings still needs them.
  await seedDefaultAppSettings();
}

/** Wipes every table, then restores default settings - a fresh install. */
export async function deleteAllData(): Promise<void> {
  db.transaction((tx) => {
    deleteEverything(tx);
  });
  await seedDefaultAppSettings();
}
