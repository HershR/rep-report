import { getExercisePersonalRecords } from "@/features/personal-records/repositories/personalRecordsRepository";
import type { SetPrResult } from "@/features/personal-records/types";
import type {
  WorkoutSessionDetails,
  WorkoutSessionExerciseWithDetails,
  WorkoutSessionSet,
} from "@/features/workouts/types";
import { isCardioExercise } from "@/features/workouts/utils/isCardioExercise";

function maxNullable(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  return Math.max(a, b);
}

/**
 * Determines whether a just-completed set is a new personal record for its
 * exercise — used to fire a live "New PR!" toast during an active workout.
 *
 * A set qualifies only if it strictly beats the best of everything logged
 * *before* this completion: prior completed sessions (via
 * `getExercisePersonalRecords`, which excludes the still-active session) plus
 * this session's own earlier completed non-warmup sets of the same exercise.
 * Returns `null` when there's nothing to celebrate so callers can early-return.
 */
export async function checkSetPersonalRecord(
  session: WorkoutSessionDetails,
  setId: string,
): Promise<SetPrResult | null> {
  let targetExercise: WorkoutSessionExerciseWithDetails | undefined;
  let targetSet: WorkoutSessionSet | undefined;
  for (const exercise of session.exercises) {
    const found = exercise.sets.find((set) => set.id === setId);
    if (found) {
      targetExercise = exercise;
      targetSet = found;
      break;
    }
  }
  if (!targetExercise || !targetSet) return null;

  if (isCardioExercise(targetExercise.exercise.category, targetExercise.exercise.name)) {
    return null;
  }

  const weight = targetSet.weight;
  const reps = targetSet.reps;
  const hasWeight = weight !== null && weight > 0;
  const hasReps = reps !== null && reps > 0;
  if (!hasWeight && !hasReps) return null;

  // Best among this session's other completed, non-warmup sets of this exercise.
  let sessionMaxWeight: number | null = null;
  let sessionMaxReps: number | null = null;
  for (const set of targetExercise.sets) {
    if (set.id === setId) continue;
    if (set.isCompleted !== 1) continue;
    if (set.setType === "warmup") continue;
    if (set.weight !== null) {
      sessionMaxWeight = maxNullable(sessionMaxWeight, set.weight);
    }
    if (set.reps !== null) {
      sessionMaxReps = maxNullable(sessionMaxReps, set.reps);
    }
  }

  // Best from prior *completed* sessions (never includes the active session).
  const history = await getExercisePersonalRecords(targetExercise.exerciseId);
  const priorBestWeight = maxNullable(sessionMaxWeight, history?.heaviestWeight?.weight ?? null);
  const priorBestReps = maxNullable(sessionMaxReps, history?.mostReps?.reps ?? null);

  const isWeightPr =
    hasWeight && (priorBestWeight === null || (weight as number) > priorBestWeight);
  const isRepsPr = hasReps && (priorBestReps === null || (reps as number) > priorBestReps);

  if (!isWeightPr && !isRepsPr) return null;

  return {
    exerciseName: targetExercise.exercise.name,
    isWeightPr,
    isRepsPr,
    weightKg: weight,
    reps,
  };
}
