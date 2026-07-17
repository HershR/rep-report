# 002 — Add a haptic tick when a set is marked complete

- **Status**: TODO
- **Commit**: 9bd106c
- **Severity**: N/A (missed opportunity / additive, not a regression)
- **Category**: 8. Missed opportunities (rewarding a completed action with only one sensory channel)
- **Estimated scope**: 1 file, ~5 line addition

## Problem

`src/features/workouts/components/WorkoutSetRow.tsx` already animates the Mark/Done button with a small scale pop when a set flips from incomplete to complete (this shipped in a prior pass — see current code below). That pop is purely visual. Fitness-tracking apps conventionally pair "you just logged a rep/set" with a light haptic tick, and this app has `expo-haptics` installed (`package.json`) but unused anywhere in the codebase. The visual feedback exists; the tactile channel that would make it land on a phone in a gym bag/pocket or glanced-at-arm's-length does not.

Current code, `src/features/workouts/components/WorkoutSetRow.tsx:76-85`:

```tsx
useEffect(() => {
  // Pop only on the incomplete → complete transition, never on mount or when un-marking.
  if (isCompleted && !wasCompletedRef.current && !reducedMotion) {
    completeButtonScale.value = withSequence(
      withTiming(1.06, { duration: 80 }),
      withTiming(1, { duration: 100 }),
    );
  }
  wasCompletedRef.current = isCompleted;
}, [isCompleted, reducedMotion, completeButtonScale]);
```

## Target

Fire a light haptic impact on the exact same incomplete → complete transition the pop already detects — but haptics must fire **regardless of reduced motion**. Reduced motion (AUDIT.md §6) governs *visual* movement; haptic feedback is a separate accessibility channel and is not something `prefers-reduced-motion`-equivalent settings suppress. The existing `!reducedMotion` guard must therefore only gate the scale animation, not the haptic:

```tsx
useEffect(() => {
  // Pop only on the incomplete → complete transition, never on mount or when un-marking.
  if (isCompleted && !wasCompletedRef.current) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!reducedMotion) {
      completeButtonScale.value = withSequence(
        withTiming(1.06, { duration: 80 }),
        withTiming(1, { duration: 100 }),
      );
    }
  }
  wasCompletedRef.current = isCompleted;
}, [isCompleted, reducedMotion, completeButtonScale]);
```

`Haptics.ImpactFeedbackStyle.Light` (not `.Medium`/`.Heavy`) is deliberate: this fires "tens of times/day" during an active session (AUDIT.md §1's frequency table), so it must stay in the background rather than announce itself — the same reasoning that already kept the visual pop subtle (1.06, not larger).

## Repo conventions to follow

- `expo-haptics`'s async call pattern is `void Haptics.xAsync(...)` — fire-and-forget, not awaited — matching how every other side-effecting call in this file already fires without blocking the UI thread (e.g. `onUpdate(...)` calls throughout this same component are never awaited either).
- The transition-detection pattern (`wasCompletedRef` tracking the previous render's value, compared against the current one, updated at the end of the same effect) is already established in this exact file (`src/features/workouts/components/WorkoutSetRow.tsx:74-85`) — do not introduce a second/different way of detecting the same transition.

## Steps

1. **Add the import** at the top of `src/features/workouts/components/WorkoutSetRow.tsx`, alongside the existing `lucide-react-native` import:

   ```tsx
   import * as Haptics from "expo-haptics";
   ```

2. **Replace the effect body** (the exact block quoted in "Problem" above) with the exact block quoted in "Target" above — no other lines in this file change.

## Boundaries

- Do NOT touch the scale-pop values (`1.06`/`80ms`/`100ms`) — those already shipped and are correct; this plan only adds the haptic alongside them.
- Do NOT add haptics anywhere else in this pass (e.g. the "Delete" button in the same component, or the workout-completion flow — that's covered separately by plan `001-workout-complete-celebration.md`, which uses a different haptic type: `notificationAsync(Success)`, appropriate to a one-shot completion event rather than a per-set tick).
- Do NOT gate the haptic behind `!reducedMotion` — see Target section for why.
- If the cited code has drifted from commit `9bd106c`, STOP and report the mismatch instead of guessing.

## Verification

- **Mechanical**: `npx tsc --noEmit` from the repo root — expect no errors.
- **Feel check** (on a physical device — haptics do not fire in simulators):
  - Mark a set complete → feel a single light tick coincide with the visual pop.
  - Un-mark it, then mark it complete again → the tick should fire again on the second completion, confirming the transition-detection (not a one-time mount effect) still works.
  - Un-mark a completed set → confirm no haptic fires (only the incomplete → complete direction ticks).
  - Enable "Reduce Motion" in device accessibility settings, mark a set complete → confirm the button no longer pops but the haptic tick still fires.
- **Done when**: the tick fires exactly once per incomplete→complete transition, never on un-marking, and is unaffected by the reduced-motion setting.
