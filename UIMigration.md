# UI Migration Plan — React Native Reusables

This document is the working plan for migrating Rep Report's screens and shared components from the legacy `StyleSheet`-based kit (`src/components/common/*`, `src/theme/*`) to **React Native Reusables (RNR)** — already installed and configured (`src/global.css`, `tailwind.config.js`, `components.json`, `src/lib/theme.ts`, `src/lib/utils.ts`). Migration happens **one screen/component at a time**, in the phase order below. Each phase is small enough to ship as its own PR.

Brand color continuity: the app's blue (`#2563EB` light / `#3B82F6` dark) is already preserved as `primary` in the new theme — no color drift, just a richer token set (secondary/muted/accent/destructive/chart-1..5 alongside it).

## Architectural decisions

| # | Decision | Answer |
|---|---|---|
| 1 | Fate of `src/components/common/*` | Coexist during transition. Mark `@deprecated` the moment a Tier-1 replacement exists. Delete each file only once a repo-wide grep shows zero importers. |
| 2 | Fate of `src/theme/*` (8 hex tokens) | Retire immediately in Phase 1 (not gradually) — `_layout.tsx` already reads both systems at once today. |
| 3 | `CustomText` replacement | A thin `src/components/ui/text.tsx` (RNR pattern, `@rn-primitives/slot`-based), not bare `<Text className=.../>` everywhere. |
| 4 | Icons: Ionicons vs. `lucide-react-native` | Adopt `lucide-react-native` for all new RNR component internals. Only swap existing `Ionicons` call sites when that file is naturally touched by a later phase; do a final convergence pass in Phase 10. |
| 5 | Bottom sheets | **Correction (Phase 5):** RNR's registry has no `sheet.tsx` — unlike shadcn/ui web, there's no dedicated Sheet file to copy. Built `src/components/ui/sheet.tsx` ourselves on top of `@rn-primitives/dialog` (bottom-anchored, slide-in, same Portal foundation as Dialog/AlertDialog) rather than a second overlay library, which is what this decision actually intended. Reuse that file — don't re-derive it or add `@gorhom/bottom-sheet`. |
| 6 | Brand color | No change — already correct in `src/lib/theme.ts`. |
| 7 | `@rn-primitives/*` install cadence | Install each primitive package in the same PR that first uses it, not all up front. |
| 8 | Deferred (explicitly out of scope) | Exposing the unused `setType` field in set rows; converting search pagination to infinite scroll; any charts/analytics work. |

## Legacy → RNR token map (Phase 1)

| Legacy (`src/theme/colors.ts`) | RNR (`src/lib/theme.ts`) |
|---|---|
| `background` | `background` |
| `surface` | `card` |
| `surfaceElevated` | `popover` |
| `text` | `foreground` |
| `textMuted` | `muted-foreground` |
| `border` | `border` |
| `primary` | `primary` |
| `primaryText` | `primary-foreground` |

## Component tiers

**Tier 1 (Phase 1, foundation for everything after):**
`Text`, `Button` (variants default/secondary/outline/ghost/destructive; sizes default/sm/lg/icon; built-in loading state; icon slot), `Card` (`CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`), `Input`, `Label`, `Separator`, `AlertDialog`, and an app-level `ConfirmDialog` wrapper over `AlertDialog` for every "are you sure?" call site in the app.

**Tier 2 (introduced exactly when first needed):**

| Component | Introduced in | Replaces |
|---|---|---|
| `Skeleton` | Phase 2 — Home | missing/ad hoc loading spinners |
| `Badge` | Phase 3 — Dashboard | plain text tags/status |
| `Tabs` (as segmented control) | Phase 4 — Profile | hand-built two-`Pressable` segmented control |
| `Switch` | Phase 4 — Profile | any binary settings toggle |
| `Checkbox` / `Select` | Phase 6 — Exercise filters | filter modal's checkbox-style pills |
| `Sheet` | Phase 6 — Exercise filters, Phase 7 — Add exercise | hand-rolled slide-up `Modal`s |
| `Dialog` | Phase 8 — Workout detail | custom unsaved-changes `Modal` |
| `Progress` | Phase 9 — Active workout (optional polish) | — |

---

## Phase 0 — Verification (no product code touched)

Smoke-test a throwaway `Button` on a scratch route. Confirm NativeWind classNames render correctly on iOS and Android, and that toggling device appearance drives both `NAV_THEME` (React Navigation chrome) and Tailwind's `dark:` variant together, consistently. Delete the scratch route once confirmed.

## Phase 1 — Tier-1 primitives + legacy theme retirement

**1a. Build Tier-1 components** under `src/components/ui/`: `text.tsx`, `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `separator.tsx`, `alert-dialog.tsx` (install `@rn-primitives/alert-dialog`), and `src/components/ConfirmDialog.tsx` (app-level, wraps `AlertDialog` with a `title`/`description`/`confirmLabel`/`cancelLabel`/`destructive?`/`onConfirm` API — this single component replaces every hand-rolled confirm `Modal` and most `Alert.alert` destructive-action call sites across later phases).

**1b. Retire the legacy theme** (separate PR): remap `src/app/_layout.tsx` to stop importing `getColors`/`useThemeColors` from `src/theme`, using the RNR `THEME`/`useColorScheme` tokens for header/background colors instead (per the token map above). Delete `src/theme/colors.ts`, `spacing.ts`, `typography.ts`, `index.ts` once nothing imports them.

No screens change visually yet — this phase only builds the tools the rest of the migration uses.

## Phase 2 — `index.tsx`, `onboarding.tsx`, `(tabs)/home.tsx`

### `src/app/index.tsx` — Startup redirect
- **Current state:** renders a fully blank `CustomScreen` while resolving whether to redirect to onboarding or home. No spinner, no branding — a flash of empty screen on every cold start.
- **Target look & function:** centered app logo/wordmark (or, absent a logo asset, just the app name in a large `Text` variant) with a `Spinner`/`ActivityIndicator` beneath it, on the themed `background` color, while the profile-existence check resolves. Redirect behavior unchanged.
- **Components:** `Text` for the wordmark; keep `ActivityIndicator` (RN built-in; RNR doesn't ship a spinner primitive) styled via `text-primary`.
- **UX improvement:** eliminates the blank-flash moment; gives the app a consistent "branded" first frame instead of a dead-looking screen.

### `src/app/onboarding.tsx` — First-run setup
- **Current state:** `CustomCard` with a plain `TextInput` for name, a button-triggered inline `DateTimePicker` for DOB, and a single CTA disabled silently until name is entered — no validation feedback.
- **Target look & function:** `Card` with `CardHeader` ("Welcome to Rep Report" title + encouraging subtitle, per `DESIGN.MD`'s tone), `CardContent` holding `Label`+`Input` for display name and a `Label`+`Button variant="outline"` that opens the DOB picker (unchanged native picker), `CardFooter` with a primary `Button` ("Let's Go", `loading` bound to `isSaving`).
- **Components:** `Card`, `Label`, `Input`, `Button`.
- **UX improvements:** show inline helper text under the name field when empty and the CTA is pressed (instead of a silently-disabled button with no explanation); this is the first screen every user sees, so its polish sets expectations for the rest of the app.

### `src/app/(tabs)/home.tsx` — Home tab
- **Current state:** greeting + "Every set counts." card + Start/Resume Workout buttons + up to 3 template quick-starts, no loading state while any of the three hooks (`useWorkoutTemplates`, `useActiveWorkout`, `useProfile`) resolve.
- **Target look & function:** `Text` greeting (`Hi {name}!`) at `title`-equivalent size; a `Card` with the motivational caption and primary `Button` "Start Workout" (+ conditional secondary `Button` "Resume Workout" when a session is active); a "Start From Template" section using `Card`s per template (or a `Skeleton` stack while `useWorkoutTemplates` is loading) and the existing encouraging empty-state copy from `DESIGN.MD` when there are none.
- **Components:** `Text`, `Card` (+ subcomponents), `Button`, `Skeleton`.
- **UX improvements:** add the missing loading state (first real use of `Skeleton` in the app); this is the most-viewed screen, so getting the primary/secondary button hierarchy (Start vs. Resume) visually right here sets the pattern for every other screen's action hierarchy.

## Phase 3 — `(tabs)/dashboard.tsx`

- **Current state:** `Card`-wrapped `react-native-calendars` `Calendar`, list of that date's completed workouts as `CustomCard`s, "Open details" rendered as a plain tappable `Text` (low affordance, small hit target).
- **Target look & function:** unchanged calendar (still the best fit for date browsing), but each workout entry becomes a full-width `Card` row: workout name + a `Badge` showing exercise/set counts and duration, with the entire row tappable (not just a text sliver) and a trailing chevron icon to signal navigability.
- **Components:** `Card`, `Badge`, `Button variant="ghost"` (or the whole `Card` wrapped in a `Pressable` with `asChild`) for the row's tap target.
- **UX improvements:** fixes the low-affordance "Open details" tap target; `Badge` gives at-a-glance workout stats without reading a sentence per row; first read-only screen migrated, proving the pattern before any destructive-action screens.

## Phase 4 — `(tabs)/profile.tsx` (3 sub-steps)

- **Current state:** one screen combining profile identity, unit settings (hand-built segmented control), and weight/height trackers across 3 `CustomCard`s; zero loading/error states anywhere; segmented control conflates weight-unit switching with `heightUnit` state.

**4a. Card shells + first loading/error/empty pattern.** Convert the 3 sections to `Card`/`CardHeader`/`CardContent`. Add a real loading state (`Skeleton` rows) and error state (inline message + retry `Button`) for all four hooks in play (`useProfile`, `useAppSettings`, and the two `useMeasurements` calls) — this screen currently has none.

**4b. Unit settings → `Tabs`-as-segmented-control.** Replace the two hand-styled `Pressable`s with a proper `Tabs` component (`Metric` / `Imperial`), and add a `Switch` for any other binary setting surfaced here (e.g. theme mode, if exposed on this screen later).

**4c. Weight/height trackers → `Input`.** Replace the raw `TextInput` + "Add" `CustomButton` rows with `Input` + `Button`; keep the existing unit-conversion math untouched (out of scope for a UI migration) but display the last-5 history as small `Card` rows instead of plain muted text lines.

- **Components:** `Card`, `Skeleton`, `Tabs`, `Switch`, `Input`, `Button`.
- **UX improvements:** this is the single biggest "no feedback" gap in the app today — adding loading/error states here is pure upside; a real segmented `Tabs` control is both clearer and decouples visually from the `heightUnit`-only coupling bug (worth flagging in code review, though the underlying state coupling itself is a logic fix outside this migration's scope).

## Phase 5 — Templates (shared components, then screens)

Migrate shared components first since both template screens depend on them:

### `TemplateExerciseBlock.tsx` / `TemplateSetRow.tsx`
- **Current state:** `CustomCard` per exercise with header + "Remove" text action, set rows in a bordered box with three synced local text buffers (duration/distance/weight) and cardio-vs-strength branching duplicated from `WorkoutSetRow`.
- **Target look & function:** `Card` per exercise (`CardHeader`: exercise name + `Button variant="ghost" size="icon"` remove action using a lucide trash icon instead of a text link); each set row becomes a compact row of `Input`s (Reps+Weight or Duration+Distance depending on `isCardioExercise`) with a trailing icon `Button` for delete.
- **Components:** `Card`, `Button` (icon variant), `Input`, `Label`.
- **UX improvement:** icon-based remove/delete actions instead of text links reduce visual noise and give a more consistent, tappable target size across every set row in the app (same visual language will be reused in Phase 8/9's `WorkoutSetRow`).

### `TemplateEditor.tsx` / `AddSavedExerciseSheet.tsx`
- **Target look & function:** editor's Name/Description fields become `Input`s with `Label`s; "Save Template" becomes a primary `Button` with `loading` state; `AddSavedExerciseSheet`'s hand-rolled slide-up `Modal` becomes an RNR `Sheet` listing favorites (each row a `Card` or simple pressable list item with a trailing "Add" `Button variant="outline" size="sm"`).
- **Components:** `Input`, `Label`, `Button`, `Sheet`.

### `src/app/workout/template/new.tsx`
- Thin wrapper around `TemplateEditor` — no independent redesign needed beyond what the editor migration already covers; add a loading indicator during the multi-step create sequence (currently silent).

### `src/app/workout/template/[templateId].tsx`
- **Current state:** "Delete Template" fires immediately with **zero confirmation** — a real bug, inconsistent with `saved.tsx`'s confirmed delete flow for the same underlying data.
- **Target look & function:** "Delete Template" becomes a `Button variant="destructive"` that opens `ConfirmDialog` before deleting (fixing the bug); loading/disabled state added to "Save" while the multi-step repository writes are in flight (currently looks synchronous despite many sequential awaits).
- **Components:** `Button`, `ConfirmDialog`.
- **UX improvement:** closes the no-confirmation delete bug — this is the concrete fix this phase exists to deliver, not an incidental side effect.
- **Deferred note:** this phase touches `TemplateSetRow` but does **not** add UI for the schema's unused `setType` (normal/warmup/drop/failure) field — tracked as a separate future feature, not bundled here.

## Phase 6 — Exercises: search, filters, detail

### `src/app/(tabs)/search.tsx` + `ExerciseFilterModal.tsx` + `ExerciseCard.tsx`
- **Current state:** plain `TextInput` search box, a `Pressable` "Filters (n)" opening a hand-rolled slide-up `Modal` with pill-style filter chips, `FlashList` results, numbered Previous/Next pagination footer, raw error message shown verbatim on failure.
- **Target look & function:** search box becomes `Input` with a leading search icon; filter trigger becomes `Button variant="outline"` showing the active filter count as a `Badge`; `ExerciseFilterModal` becomes a `Sheet` sliding up from the bottom, with each filter dimension (Categories/Equipment/Muscles) rendered as a `Checkbox` list (or `Select` if a single-choice dimension is added later) instead of custom pill `Pressable`s; active filters shown as a horizontal row of dismissible `Badge` chips above the results so users can see (and remove) filters without reopening the sheet; friendlier copy on the error `Card` instead of the raw error message, with a `Button` "Retry".
- **Components:** `Input`, `Button`, `Badge`, `Sheet`, `Checkbox`, `Card`.
- **UX improvements:** visible active-filter chips are a net-new affordance (today the only feedback is a count in the trigger label); friendlier error copy fits `DESIGN.MD`'s encouraging-tone principle.
- **Deferred note:** numbered Previous/Next pagination is kept as-is; converting to infinite scroll is explicitly out of scope for this migration (flagged, not silently decided).

`ExerciseCard.tsx` itself: keep its layout (thumbnail + name/category + favorite heart), just restyle the outer container as `Card` and the favorite icon as a `Button variant="ghost" size="icon"` for a consistent, larger tap target than a bare icon `Pressable`.

### `src/app/exercise/[exerciseId].tsx`
- **Current state:** static "Exercise Detail" header regardless of which exercise is open; no image shown; favorite button missing entirely for local-only (non-WGER) exercises.
- **Target look & function:** the screen's title becomes the actual exercise name (fixing the bug); detail rendered as a `Card` with the exercise image (when `imageUrl` exists) at the top, `Badge`s for category/equipment, and primary/secondary muscle lists as small `Badge` rows; a favorite `Button variant="ghost" size="icon"` shown for **all** exercises regardless of source (fixing the local-only gap), disabled/hidden only if favoriting truly isn't supported for that source.
- **Components:** `Card`, `Badge`, `Button`.
- **UX improvements:** both fixes above were explicit rough edges found during research — this phase exists specifically to close them, not just restyle.

## Phase 7 — `(tabs)/saved.tsx`, `TemplateCard.tsx`

- **Current state:** favorited exercises (`FlashList`) nested inside an outer `ScrollView` (`CustomScreen scroll`) — a known React Native anti-pattern that produces console warnings and perf issues — plus two near-identical hand-rolled confirm-delete `Modal`s (one for exercises, one for templates) with duplicated overlay/button styling.
- **Target look & function:** restructure the screen so the `FlashList` of favorites is not nested inside a scrolling parent (e.g. give the exercises section a bounded height, or move both lists into a single outer `FlashList` with section headers) — this is a structural fix, addressed before any visual restyling in this phase. Both delete confirmations converge onto the shared `ConfirmDialog` built in Phase 1. `TemplateCard` becomes a `Card` with the delete action as a `Button variant="ghost" size="icon"` (trash icon) instead of a text link.
- **Components:** `Card`, `Button`, `ConfirmDialog`, `Badge` (exercise/template counts, matching Phase 3's pattern).
- **UX improvements:** removes a real perf/warning bug (nested VirtualizedList) and eliminates ~2x duplicated modal code by reusing one shared confirm component — the single biggest de-duplication win in the whole migration.

## Phase 8 — `workout/[workoutId].tsx` (completed workout editor, 4 sub-steps)

- **Current state:** `react-hook-form`+zod form with a complex diffing algorithm on save; zod validation is wired but errors are **never displayed**; delete uses native `Alert.alert` while the separate unsaved-changes flow uses a custom `Modal` — two different dialog UX patterns on the same screen.

**8a. Shared components.** Migrate `WorkoutExerciseBlock`/`WorkoutSetRow` to the same `Card`+`Input`+icon-`Button` pattern established in Phase 5's `TemplateExerciseBlock`/`TemplateSetRow` (these two pairs should end up visually and structurally identical, differing only in the data they bind — reuse as much as the codebase allows).

**8b. Form fields + surfaced validation.** Name/notes fields become `Input`/`Textarea`-equivalent with `Label`s; wire `formState.errors` (already computed by the existing `zodResolver`, currently unused) to inline error text under each field — this is a real bug fix, not new scope, since the validation logic already exists.

**8c. Delete → `ConfirmDialog`.** Replace the native `Alert.alert` delete confirmation with `ConfirmDialog` (`destructive` styling) for visual consistency with the rest of the app.

**8d. Unsaved-changes flow → `Dialog`.** Replace the custom `Modal` (Save/Discard/Cancel) with RNR's `Dialog` (three actions still: primary "Save", destructive "Discard", plain "Cancel"), keeping the existing `navigation.addListener("beforeRemove", ...)` guard logic unchanged.

- **Components:** `Card`, `Input`, `Label`, `Button`, `ConfirmDialog`, `Dialog`.
- **UX improvement:** converges two inconsistent dialog patterns (`Alert.alert` + custom `Modal`) onto RNR's `Dialog`/`AlertDialog` family, and finally surfaces validation errors that have silently existed in the form state all along.

## Phase 9 — `workout/active.tsx` (live workout session, done last, 4 sub-steps)

Sequenced last deliberately: it's the highest-risk screen (live elapsed timer, debounced per-keystroke set updates) and benefits from every other shared component already being proven in production by this point.

**9a. `WorkoutTimerHeader` — visual-only.** Restyle as a `Card` showing workout name + live `HH:MM:SS`; no logic change.

**9b. Reuse Phase 8's set-row components.** Confirm `WorkoutExerciseBlock`/`WorkoutSetRow` (already migrated) work correctly under this screen's debounced-update/commit-on-change mode — this is a verification step, not new UI work.

**9c. Complete-workout flow → `AlertDialog`.** The existing 3-way branching (`Alert.alert`: "Keep all sets" / "Remove incomplete sets" / Cancel) becomes an `AlertDialog` with three explicit `Button`s instead of native alert buttons — behavior-preserving; test all three paths explicitly since this is the app's most consequential confirmation flow.

**9d. Non-negotiable: "Cancel Workout" → `ConfirmDialog` (destructive).** Currently a plain muted text link with **zero confirmation** — one accidental tap discards an entire live workout session with no way back. Wire it to `ConfirmDialog` with a destructive-styled confirm action. Flag for extra manual QA since this is a deliberate behavior change (adding a confirmation step), not just a visual swap.

- **Components:** `Card`, `AlertDialog`, `ConfirmDialog`, `Button`.
- **UX improvement:** 9d is the single highest-value fix in this entire migration — it directly prevents accidental data loss on the app's most time-invested user action.

## Phase 10 — Cleanup

- Grep-confirm zero remaining imports of `src/components/common/*` across the codebase; delete the folder.
- Grep-confirm zero remaining hand-rolled `Modal` or `Alert.alert` usage in `src/app`/`src/features` (everything should now route through `ConfirmDialog`/`AlertDialog`/`Dialog`/`Sheet`).
- Finish the Ionicons → `lucide-react-native` convergence: swap the tab bar (`(tabs)/_layout.tsx`) icons and any other remaining `Ionicons` call sites to `lucide-react-native` for a single consistent icon set.
- Add a short changelog section to this document noting what shipped in each phase and re-stating the deferred items (set-type field exposure, search infinite scroll, charts/analytics) so they aren't lost.

## Expected end-to-end user experience after migration

- Every screen shares one visual language (radius, spacing, color tokens, button hierarchy) instead of each screen hand-rolling its own `StyleSheet`.
- Every destructive action (delete template, delete workout, cancel active workout, remove favorite) asks for confirmation through the same `ConfirmDialog`, closing two real accidental-data-loss bugs found during research.
- Every list/data screen has a real loading state (`Skeleton`) and a real error state with a retry action, instead of silently rendering blank or showing a raw error string.
- Filter/picker interactions (exercise search, add-exercise-to-workout) use a consistent bottom `Sheet` pattern instead of three visually-different hand-rolled modals.
- The app keeps its existing blue brand identity throughout — this is a component-library and consistency upgrade, not a rebrand.

## Changelog

**Phase 1** — Built the Tier-1 primitives (`Text`, `Button`, `Card`, `Input`, `Label`, `Separator`, `AlertDialog`, `ConfirmDialog`) under `src/components/ui/`. Remapped `src/app/_layout.tsx` off the legacy theme onto `THEME`/`NAV_THEME`. Marked `CustomButton`/`CustomCard`/`CustomText` `@deprecated` (not deleted yet — still relied on by every unmigrated screen at the time).

**Phase 2** — `index.tsx` (branded spinner instead of a blank splash), `onboarding.tsx` (Card form + inline name-validation message instead of a silently-disabled button), `(tabs)/home.tsx` (Card actions + first `Skeleton` loading state). Extended `Button` with a `loading` prop — upstream RNR's bare `Button` has none, but the Tier-1 spec called for it.

**Phase 3** — `(tabs)/dashboard.tsx`: workout rows became full tappable `Card`s with `Badge` stat chips and a trailing chevron, fixing the low-affordance plain-text "Open details" link. First screen needing a net-new icon (not an existing Ionicons site), so `lucide-react-native` was installed here per decision #4.

**Phase 4** — `(tabs)/profile.tsx`, all 3 sub-steps: `Skeleton`/error+Retry states added to all 3 sections (previously none existed anywhere on this screen), segmented control replaced with real `Tabs`, trackers moved to `Input`. Added a `refetch` field to `useMeasurements` since the hook didn't expose one but the plan required a Retry action. Deliberately skipped `Switch` — no actual boolean setting exists on this screen.

**Phase 5** — Templates: `TemplateSetRow`/`TemplateExerciseBlock`/`TemplateEditor`/`AddSavedExerciseSheet`, then both template screens. **Correction:** decision #5 assumed RNR ships a `Sheet` component like shadcn/ui web — it doesn't (checked the full registry file list directly). Built `src/components/ui/sheet.tsx` ourselves on `@rn-primitives/dialog` (bottom-anchored, slide-in) instead. Added `Textarea` for the multiline description field. Landed the "Delete Template" confirmation fix.

**Phase 6** — Exercises: `search.tsx`, `ExerciseFilterModal` (→ `Sheet` + new `Checkbox`), `ExerciseCard`, `exercise/[exerciseId].tsx`. Added active-filter `Badge` chips (net-new affordance). Fixed both flagged detail-screen bugs: real exercise name as the heading, favorite button always visible (disabled, not hidden, when there's no WGER link — confirmed at the repository layer that's a genuine data-layer limit, not a UI oversight). Caught and avoided a Label+Checkbox double-toggle bug before it shipped.

**Phase 7** — `(tabs)/saved.tsx` restructured onto a single `FlashList` (discriminated-union rows + `getItemType`) to eliminate the nested-VirtualizedList-in-ScrollView anti-pattern, rather than papering over it with a bounded height. Both hand-rolled confirm modals converged onto `ConfirmDialog`. `TemplateCard` → `Card` + `Badge` + icon `Button`.

**Phase 8** — `workout/[workoutId].tsx` (completed workout editor), all 4 sub-steps: `WorkoutExerciseBlock`/`WorkoutSetRow` now mirror the Phase 5 template pair structurally (the Reps field's pre-existing `defaultValue`/asymmetric-commit quirk was preserved, not fixed — out of scope). `errors.name?.message` finally surfaced under the Name field. Delete → `ConfirmDialog`. Unsaved-changes flow → new `Dialog` component (Tier-2, first introduced here).

**Phase 9** — `workout/active.tsx`, done last as planned, all 4 sub-steps: `WorkoutTimerHeader` restyled only. Confirmed (not rebuilt) that Phase 8's set-row components work under this screen's debounced/commit-on-change mode. 3-way complete-with-incomplete-sets branch → `AlertDialog` with 3 manually-closed `Button`s (verified logic-equivalent to the original branch-by-branch). **The migration's single highest-value fix**: "Cancel Workout" now requires confirming through a destructive `ConfirmDialog` — previously one accidental tap discarded an entire live session with no way back.

**Phase 10** — Cleanup: deleted `CustomButton`/`CustomCard`/`CustomText` (confirmed zero importers). Finished retiring `src/theme/*` entirely — its last consumer, `CustomScreen` (which itself has no RNR equivalent and stays permanently), was moved onto `THEME`/`useColorScheme`. Remapped the tab bar (`(tabs)/_layout.tsx`) off the legacy theme and swapped its `Ionicons` for `lucide-react-native` (`Home`/`Search`/`BarChart3`/`Bookmark`/`User`) — the last Ionicons site in the app. Converted the one remaining `Alert.alert` (a single-button "add an exercise first" info message in `active.tsx`, deliberately left out of Phase 9c's scope) to an `AlertDialog`. Net result: zero remaining `src/components/common/*` imports beyond `CustomScreen`, zero remaining hand-rolled `Modal`/`Alert.alert`, zero remaining `Ionicons`/legacy-theme imports anywhere in `src/`. iOS bundle size dropped (~9.59MB → ~9.16MB) from the dead-code and unused-font-asset removal.

### Deferred items (still open, not lost)

- **Exposing the `setType` field** (normal/warmup/drop/failure) in `TemplateSetRow`/`WorkoutSetRow` UI — schema support exists, no UI ever surfaced it, and this migration didn't add it (flagged explicitly in Phase 5).
- **Search pagination** — still numbered Previous/Next; converting to infinite scroll was explicitly out of scope (flagged in Phase 6).
- **Charts/analytics** — untouched, per `DESIGN.MD`'s MVP scope. `chart1`–`chart5` HSL tokens already exist in `src/lib/theme.ts` for whenever that work starts.
- **`@expo/vector-icons` package** — left installed in `package.json` even though nothing in `src/` imports it anymore post-cleanup; not removed since that's a dependency change beyond this migration's stated scope, not an app-code change.
