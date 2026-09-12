import type { ExerciseSearchResult } from "@/features/exercises/types";
import { isCardioExercise } from "@/features/workouts/utils/isCardioExercise";
import { mapWgerExerciseToSearchResult } from "@/services/wger/mappers";
import type { WgerExerciseInfo } from "@/services/wger/types";

import fixture from "./fixtures/wgerExercises.json";

/**
 * The exercises the demo data is built from, keyed symbolically so the
 * progression tables never have to spell out a wger id or a display name.
 */
export type DemoExerciseKey =
  | "benchPress"
  | "inclineBenchPress"
  | "shoulderPress"
  | "latPulldown"
  | "barbellCurl"
  | "tricepsPushdown"
  | "squat"
  | "deadlift"
  | "legPress"
  | "legCurl"
  | "calfRaise";

export const DEMO_EXERCISE_WGER_IDS: Record<DemoExerciseKey, number> = {
  benchPress: 73,
  inclineBenchPress: 538,
  shoulderPress: 566,
  latPulldown: 1510,
  barbellCurl: 91,
  tricepsPushdown: 1185,
  squat: 615,
  deadlift: 184,
  legPress: 371,
  legCurl: 364,
  calfRaise: 590,
};

const FIXTURE_BY_WGER_ID = new Map(
  (fixture.results as WgerExerciseInfo[]).map((entry) => [entry.id, entry]),
);

/**
 * Runs the committed wger payloads through the app's own mapper, so a seeded
 * exercise is byte-identical to one the user could have favourited from Search.
 *
 * Throws rather than degrading: a fixture that has drifted out of sync with
 * `DEMO_EXERCISE_WGER_IDS`, or an exercise whose name would be swallowed by
 * `isCardioExercise`, should fail loudly at seed time. A cardio-classified
 * exercise is silently excluded from personal records and its own progress
 * chart, which is invisible in the UI and maddening to debug.
 */
export function loadDemoExercises(): Record<
  DemoExerciseKey,
  ExerciseSearchResult
> {
  const entries = Object.entries(DEMO_EXERCISE_WGER_IDS) as [
    DemoExerciseKey,
    number,
  ][];

  return entries.reduce(
    (accumulator, [key, wgerExerciseId]) => {
      const raw = FIXTURE_BY_WGER_ID.get(wgerExerciseId);
      if (!raw) {
        throw new Error(
          `Demo fixture is missing wger exercise ${wgerExerciseId} (${key})`,
        );
      }

      const mapped = mapWgerExerciseToSearchResult(raw);
      if (isCardioExercise(mapped.category, mapped.name)) {
        throw new Error(
          `Demo exercise "${mapped.name}" (${key}) is treated as cardio and would be excluded from records and charts`,
        );
      }

      accumulator[key] = mapped;
      return accumulator;
    },
    {} as Record<DemoExerciseKey, ExerciseSearchResult>,
  );
}
