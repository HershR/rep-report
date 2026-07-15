# Rep Report — TODO

Actionable follow-ups from an MVP audit against `DESIGN.MD` section 2.1 (MVP Goals). Scoped to MVP only — future goals (cloud sync, PRs, charts, etc.) are intentionally excluded.

---

## Part 1 — Incomplete / Improvable Features

### 1. Onboarding is missing entirely

**Issue:** [`src/app/index.tsx`](src/app/index.tsx) redirects straight to `(tabs)/home` on launch. There is no first-run flow, no welcome screen, and nothing prompts a new user to set up their profile. A brand-new user lands on an empty Home tab with no explanation of what to do first.

**Improvement needed:** A lightweight, one-time onboarding flow that welcomes the user, briefly explains the app, and collects the initial profile (display name, optional date of birth) before dropping them into the tab bar. Must stay beginner-friendly per section 3 (encouraging tone, no dense screens).

**Steps:**
- [ ] Add an `isOnboarded` flag to `app_settings` (or a dedicated `onboarding` table) — persisted in SQLite, not just in-memory state.
- [ ] Build `src/app/onboarding.tsx` (or a small stack under `src/app/onboarding/`) with: welcome/encouragement copy → display name + optional DOB form (reuse `react-hook-form` + `zod`, same validation as the Profile screen) → "Let's go" CTA.
- [ ] In `src/app/index.tsx`, check `isOnboarded` on launch: if false, redirect to `/onboarding`; if true, redirect to `(tabs)/home` as today.
- [ ] On onboarding completion, save the profile via the existing `profileRepository`, set `isOnboarded = true`, and redirect to Home.
- [ ] Add an empty-state nudge on Home ("Ready for your first Rep Report?") for users who skip profile fields, consistent with section 14.1 copy.

**Definition of done:**
- A fresh install (empty DB) shows the onboarding flow before any tab is reachable.
- Completing onboarding writes a profile row and persists `isOnboarded = true`, so relaunching the app skips straight to Home.
- Skipping optional fields (DOB) doesn't block completion.
- Manual QA: uninstall/reinstall (or clear app data) and confirm the flow appears exactly once.

---

### 2. Distance-based set logging isn't exposed in the UI

**Issue:** The schema and repository already support a `distance` value on `workout_sets` (`src/db/schema.ts:140`, `addSetToWorkout`/`updateSet` in [`workoutRepository.ts`](src/features/workouts/repositories/workoutRepository.ts)), but [`WorkoutSetRow.tsx`](src/features/workouts/components/WorkoutSetRow.tsx) only ever renders **either** reps+weight **or** a duration field, based on `isCardioExercise`. There is no input for distance anywhere in the app. A distance-tracked exercise (e.g. running, rowing for distance) has no way to actually log its distance, even though DESIGN.MD explicitly requires "reps, weight, time, **or distance**."

Additionally, `workout_template_sets` has no `targetDistance` column at all (`src/db/schema.ts:76-91`), so templates can't even define a distance target, unlike `targetReps`/`targetWeight`/`targetDurationSeconds`.

**Improvement needed:** Add a distance input to the active/completed workout set row, and add distance targets to templates, using the app's configured `distanceUnit` (`mi`/`km`) from `app_settings`.

**Steps:**
- [ ] Add `targetDistance: real("target_distance")` to `workout_template_sets` in `src/db/schema.ts`, generate a Drizzle migration, and apply it.
- [ ] Update `TemplateEditor.tsx` / `TemplateExerciseBlock.tsx` to accept a target distance field, following the same pattern as `targetDurationSeconds`.
- [ ] Update `isCardioExercise` (or introduce a distinct classification) so exercises can be flagged as distance-based, not just duration-based cardio — some exercises may want both duration and distance.
- [ ] Add a distance `TextInput` to `WorkoutSetRow.tsx`, wired to `onUpdate`'s existing `distance` field (already passed through by `updateSet`/`addSetToWorkout`).
- [ ] Display distance using `appSettings.distanceUnit`, matching the unit-conversion pattern already used for weight/height in `profile.tsx`.
- [ ] Update `WorkoutExerciseBlock.tsx` prop types to pass `distance` through `onUpdateSet`/`onAddSet` alongside reps/weight/duration.

**Definition of done:**
- A user can add a set to a distance-based exercise and enter/save a distance value; it persists after app restart and appears correctly in workout history and the workout detail edit screen.
- Templates can define a target distance per set, and starting a workout from that template carries the target distance into the new session's sets (same as reps/weight/duration today).
- Distance values respect the user's `mi`/`km` setting from Profile.

---

### 3. Body measurements only support weight and height

**Issue:** [`measurementRepository.ts`](src/features/measurements/repositories/measurementRepository.ts:7) hardcodes `SUPPORTED_MEASUREMENT_TYPES = ["weight", "height"]` and throws `"Unsupported measurement type"` for anything else. DESIGN.MD section 6.5 / 7.5 lists optional body measurements — chest, waist, hips, shoulders, left/right arm, left/right thigh — none of which are reachable from the UI or repository, even though the `measurements` table schema is already generic enough to store them.

**Improvement needed:** Extend measurement tracking to the full set of body measurement types, with a UI to add/view each one.

**Steps:**
- [ ] Expand `SUPPORTED_MEASUREMENT_TYPES` in `measurementRepository.ts` to include `chest`, `waist`, `hips`, `shoulders`, `left_arm`, `right_arm`, `left_thigh`, `right_thigh` (matching DESIGN.MD 7.5 exactly).
- [ ] Generalize `useMeasurements` hook usage so it isn't weight/height-specific in naming/behavior (it's already parameterized by type — mostly a call-site change).
- [ ] Add a "Body Measurements" section to `profile.tsx` (or a new `src/app/measurements/` screen per the original project-structure plan) listing each optional measurement type with an add-entry form and recent history, reusing the existing weight/height card pattern.
- [ ] Respect unit conventions: store consistently (e.g. cm) and convert for display based on `appSettings.heightUnit`, same as height today.
- [ ] Add a `MeasurementEntryForm`/`MeasurementHistoryList` shared component (per DESIGN.MD 13.4) instead of duplicating the inline weight/height JSX for every measurement type.

**Definition of done:**
- User can add a value for each of the 8 optional measurement types plus weight/height, and see the last N entries per type.
- All entries persist historically (never overwritten) and survive app restart.
- Empty state shown per type when no entries exist yet, consistent with section 14.1 tone.

---

### 4. No prompt for incomplete sets when completing a workout — ✅ Done

**Issue:** DESIGN.MD section 11.4 requires: *"Allow completion with incomplete sets, but ask the user whether to remove incomplete sets or keep them."* Currently, `onComplete` in [`active.tsx`](src/app/workout/active.tsx:75-82) only validates that at least one exercise exists, then calls `completeWorkout` immediately — there's no check for sets where `isCompleted` is false, and no user choice offered.

**Improvement needed:** Before completing, detect any sets with `isCompleted === 0` and prompt the user to keep or discard them.

**Steps:**
- [x] In `active.tsx`, before calling `completeWorkout`, scan `activeWorkout.exercises[].sets` for any `isCompleted === 0`.
- [x] If incomplete sets exist, show a confirmation (`Alert.alert`, 3-button native alert, matching the destructive-confirm pattern in `[workoutId].tsx`'s `onDeleteWorkout`) with three choices: "Cancel", "Keep all sets", "Remove incomplete sets".
- [x] Add a repository function `removeIncompleteSets(workoutSessionId)` in `workoutRepository.ts` that bulk-deletes sets with `isCompleted = 0` for a session in a single query (no per-set reindexing needed since the session completes immediately after).
- [x] Wire the choice through a new `removeIncompleteSets` mutation in `useActiveWorkout.ts`: "Remove" calls it before `completeWorkout`; "Keep" skips straight to `completeWorkout`; "Cancel" does nothing.

**Definition of done:**
- Completing a workout with all sets marked done skips the prompt entirely (no regression for the common path). ✅
- Completing a workout with at least one incomplete set shows the prompt; choosing "Remove" deletes those sets before marking the session completed; choosing "Keep" completes with sets untouched; "Cancel" returns to the active workout unchanged. ✅

Manual QA still recommended per the plan's verification steps (start a workout, add an exercise, add 2 sets, mark one complete, confirm each of the three prompt outcomes, plus the two regression paths).

---

### 5. Template exercises can't be reordered

**Issue:** DESIGN.MD lists exercise reordering in templates as "if practical" (Stage 4 tasks), not a hard MVP requirement, but `TemplateEditor.tsx` currently only supports add/delete — there's no way to change exercise order after adding them, short of deleting and re-adding.

**Improvement needed:** Allow drag-to-reorder or up/down controls on template exercises.

**Steps:**
- [ ] Add simple "Move up" / "Move down" pressable controls to `TemplateExerciseBlock.tsx` (lower effort than full drag-and-drop, and matches the app's plain-list UI elsewhere).
- [ ] On move, swap `orderIndex` values via `setValue` in `TemplateEditor.tsx`, following the same re-indexing pattern already used in `onDeleteExercise`.
- [ ] Persist the new order on save through the existing `templateRepository` update path (no schema change needed — `orderIndex` already exists).

**Definition of done:**
- User can reorder exercises within a template before saving, and the saved order is reflected when the template is reopened or used to start a workout.

---

## Part 2 — Missing Features (not present at all)

*(No fully-missing MVP features were found beyond onboarding, which is covered in Part 1, item 1 — everything else audited is at least partially implemented. This section is reserved for tracking anything discovered during future audits.)*

---

## Priority order (suggested)

1. **Incomplete-set completion prompt** (#4) — smallest change, directly fixes a documented required flow.
2. **Distance-based set logging** (#2) — closes an explicit MVP requirement gap ("reps, weight, time, or distance").
3. **Onboarding** (#1) — first-impression gap for every new user.
4. **Body measurements expansion** (#3) — larger surface area (schema is ready, UI/repository work is the bulk of it).
5. **Template exercise reordering** (#5) — polish, not a hard MVP blocker.
