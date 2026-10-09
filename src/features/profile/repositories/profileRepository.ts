import { asc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { createUuid, nowUtc } from "@/db/utils";
import { profile, type Profile } from "@/db/schema";

export async function createProfile(input: {
  displayName: string;
  dateOfBirth?: string | null;
}): Promise<Profile> {
  const id = createUuid();
  const timestamp = nowUtc();

  await db.insert(profile).values({
    id,
    displayName: input.displayName,
    dateOfBirth: input.dateOfBirth ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const created = await getProfileById(id);
  if (!created) throw new Error("Failed create profile");
  return created;
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const [row] = await db.select().from(profile).where(eq(profile.id, id)).limit(1);
  return row ?? null;
}

export async function getProfile(): Promise<Profile | null> {
  const [row] = await db.select().from(profile).orderBy(asc(profile.createdAt)).limit(1);
  return row ?? null;
}

export async function upsertProfile(input: {
  displayName: string;
  dateOfBirth?: string | null;
}): Promise<Profile> {
  const existing = await getProfile();
  if (!existing) {
    return createProfile({
      displayName: input.displayName.trim(),
      dateOfBirth: input.dateOfBirth ?? null,
    });
  }

  const updated = await updateProfile(existing.id, {
    displayName: input.displayName.trim(),
    dateOfBirth: input.dateOfBirth ?? null,
  });
  if (!updated) throw new Error("Failed update profile");
  return updated;
}

export async function updateProfile(
  id: string,
  input: { displayName?: string; dateOfBirth?: string | null },
): Promise<Profile | null> {
  await db
    .update(profile)
    .set({
      ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
      ...(input.dateOfBirth !== undefined ? { dateOfBirth: input.dateOfBirth } : {}),
      updatedAt: nowUtc(),
    })
    .where(eq(profile.id, id));

  return getProfileById(id);
}
