import { and, eq, inArray, ne } from "drizzle-orm";

import { db } from "@/db/client";
import { exercises, workoutSessionExercises, workoutSessions, workoutSets } from "@/db/schema";
import { isCardioExercise } from "@/features/workouts/utils/isCardioExercise";
import type {
  ExercisePersonalRecords,
  ExercisePersonalRecordsSummary,
  PersonalRecordEntry,
} from "@/features/personal-records/types";

type QualifyingSet = {
  exerciseId: string;
  workoutSessionId: string;
  achievedAt: string;
  weight: number | null;
  reps: number | null;
};

async function getQualifyingSets(exerciseIdFilter?: string): Promise<QualifyingSet[]> {
  const completedSessions = await db
    .select({ id: workoutSessions.id, completedAt: workoutSessions.completedAt })
    .from(workoutSessions)
    .where(eq(workoutSessions.status, "completed"));

  const completedSessionIds = completedSessions.map((row) => row.id);
  if (completedSessionIds.length === 0) return [];
  const sessionCompletedAt = new Map(completedSessions.map((row) => [row.id, row.completedAt] as const));

  const sessionExerciseRows = await db
    .select({
      id: workoutSessionExercises.id,
      exerciseId: workoutSessionExercises.exerciseId,
      workoutSessionId: workoutSessionExercises.workoutSessionId,
    })
    .from(workoutSessionExercises)
    .where(
      exerciseIdFilter
        ? and(
            inArray(workoutSessionExercises.workoutSessionId, completedSessionIds),
            eq(workoutSessionExercises.exerciseId, exerciseIdFilter),
          )
        : inArray(workoutSessionExercises.workoutSessionId, completedSessionIds),
    );
  if (sessionExerciseRows.length === 0) return [];

  const sessionExerciseContext = new Map(sessionExerciseRows.map((row) => [row.id, row] as const));

  const setRows = await db
    .select({
      workoutSessionExerciseId: workoutSets.workoutSessionExerciseId,
      weight: workoutSets.weight,
      reps: workoutSets.reps,
    })
    .from(workoutSets)
    .where(
      and(
        inArray(workoutSets.workoutSessionExerciseId, sessionExerciseRows.map((row) => row.id)),
        eq(workoutSets.isCompleted, 1),
        ne(workoutSets.setType, "warmup"),
      ),
    );

  return setRows
    .map((set) => {
      const context = sessionExerciseContext.get(set.workoutSessionExerciseId);
      const achievedAt = context ? sessionCompletedAt.get(context.workoutSessionId) : null;
      if (!context || !achievedAt) return null;
      return {
        exerciseId: context.exerciseId,
        workoutSessionId: context.workoutSessionId,
        achievedAt,
        weight: set.weight,
        reps: set.reps,
      };
    })
    .filter((row): row is QualifyingSet => Boolean(row));
}

function computeRecordsFromSets(exerciseId: string, sets: QualifyingSet[]): ExercisePersonalRecords {
  let heaviestWeight: PersonalRecordEntry | null = null;
  let bestSetVolume: PersonalRecordEntry | null = null;
  let mostReps: PersonalRecordEntry | null = null;
  const sessionVolumes = new Map<string, { volume: number; achievedAt: string }>();

  for (const set of sets) {
    if (set.weight !== null && (heaviestWeight === null || set.weight > (heaviestWeight.weight ?? -Infinity))) {
      heaviestWeight = {
        weight: set.weight,
        reps: set.reps,
        volume: null,
        achievedAt: set.achievedAt,
        workoutSessionId: set.workoutSessionId,
      };
    }

    if (set.reps !== null && (mostReps === null || set.reps > (mostReps.reps ?? -Infinity))) {
      mostReps = {
        weight: set.weight,
        reps: set.reps,
        volume: null,
        achievedAt: set.achievedAt,
        workoutSessionId: set.workoutSessionId,
      };
    }

    if (set.weight !== null && set.reps !== null) {
      const volume = set.weight * set.reps;

      if (bestSetVolume === null || volume > (bestSetVolume.volume ?? -Infinity)) {
        bestSetVolume = {
          weight: set.weight,
          reps: set.reps,
          volume,
          achievedAt: set.achievedAt,
          workoutSessionId: set.workoutSessionId,
        };
      }

      const existingSessionVolume = sessionVolumes.get(set.workoutSessionId);
      if (existingSessionVolume) {
        existingSessionVolume.volume += volume;
      } else {
        sessionVolumes.set(set.workoutSessionId, { volume, achievedAt: set.achievedAt });
      }
    }
  }

  let bestSessionVolume: PersonalRecordEntry | null = null;
  for (const [workoutSessionId, entry] of sessionVolumes) {
    if (bestSessionVolume === null || entry.volume > (bestSessionVolume.volume ?? -Infinity)) {
      bestSessionVolume = {
        weight: null,
        reps: null,
        volume: entry.volume,
        achievedAt: entry.achievedAt,
        workoutSessionId,
      };
    }
  }

  return { exerciseId, heaviestWeight, bestSetVolume, bestSessionVolume, mostReps };
}

function hasAnyRecord(records: ExercisePersonalRecords): boolean {
  return Boolean(
    records.heaviestWeight || records.bestSetVolume || records.bestSessionVolume || records.mostReps,
  );
}

export async function getExercisePersonalRecords(exerciseId: string): Promise<ExercisePersonalRecords | null> {
  const [exerciseRow] = await db
    .select({ id: exercises.id, name: exercises.name, category: exercises.category })
    .from(exercises)
    .where(eq(exercises.id, exerciseId))
    .limit(1);
  if (!exerciseRow || isCardioExercise(exerciseRow.category, exerciseRow.name)) return null;

  const sets = await getQualifyingSets(exerciseId);
  if (sets.length === 0) return null;

  const records = computeRecordsFromSets(exerciseId, sets);
  return hasAnyRecord(records) ? records : null;
}

export async function getAllPersonalRecords(): Promise<ExercisePersonalRecordsSummary[]> {
  const sets = await getQualifyingSets();
  if (sets.length === 0) return [];

  const setsByExerciseId = new Map<string, QualifyingSet[]>();
  for (const set of sets) {
    const list = setsByExerciseId.get(set.exerciseId) ?? [];
    list.push(set);
    setsByExerciseId.set(set.exerciseId, list);
  }

  const exerciseRows = await db
    .select({ id: exercises.id, name: exercises.name, category: exercises.category })
    .from(exercises)
    .where(inArray(exercises.id, [...setsByExerciseId.keys()]));

  const summaries: ExercisePersonalRecordsSummary[] = [];
  for (const exerciseRow of exerciseRows) {
    if (isCardioExercise(exerciseRow.category, exerciseRow.name)) continue;

    const exerciseSets = setsByExerciseId.get(exerciseRow.id);
    if (!exerciseSets || exerciseSets.length === 0) continue;

    const records = computeRecordsFromSets(exerciseRow.id, exerciseSets);
    if (!hasAnyRecord(records)) continue;

    summaries.push({
      ...records,
      exerciseName: exerciseRow.name,
      exerciseCategory: exerciseRow.category,
    });
  }

  summaries.sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
  return summaries;
}
