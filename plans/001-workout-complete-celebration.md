# 001 — Add a celebration moment when a workout is completed

- **Status**: TODO
- **Commit**: 9bd106c
- **Severity**: N/A (missed opportunity / additive, not a regression)
- **Category**: 8. Missed opportunities (rare, high-emotion moment with none of its delight budget used)
- **Estimated scope**: 2 files — 1 new component, 1 edit to `src/app/workout/active.tsx`

## Problem

`src/app/workout/active.tsx` has three code paths that finish a workout. Every one of them calls `completeWorkout(...)` and then immediately `router.replace("/(tabs)/home")` — there is zero feedback between "you just finished" and "you're already looking at the Home tab." This is the single highest-time-investment action in the app (a full workout session, DESIGN.MD §3 calls for "rewarding completed actions"), and today it feels identical to canceling.

Current code, `src/app/workout/active.tsx:146-178`:

```tsx
const onComplete = async () => {
  await flushPendingSetUpdates();

  if (!canComplete) {
    setNoExerciseAlertOpen(true);
    return;
  }

  const hasIncompleteSets = activeWorkout.exercises.some((exercise) =>
    exercise.sets.some((set) => set.isCompleted === 0),
  );

  if (!hasIncompleteSets) {
    await completeWorkout(activeWorkout.id);
    router.replace("/(tabs)/home");
    return;
  }

  setIncompleteSetsDialogOpen(true);
};

const onKeepAllSetsAndComplete = async () => {
  setIncompleteSetsDialogOpen(false);
  await completeWorkout(activeWorkout.id);
  router.replace("/(tabs)/home");
};

const onRemoveIncompleteSetsAndComplete = async () => {
  setIncompleteSetsDialogOpen(false);
  await removeIncompleteSets(activeWorkout.id);
  await completeWorkout(activeWorkout.id);
  router.replace("/(tabs)/home");
};
```

Three separate call sites, three duplicated `completeWorkout` + `router.replace` pairs, and none of them pause for so much as a frame.

## Target

A brief, full-screen celebration overlay renders over the current screen for a fixed dwell (auto-advances, but is also tap-to-dismiss-early so a user who does this several times a week never feels stuck waiting on it):

- A solid-color circular badge (96×96, `borderRadius: 48`) containing a plain checkmark icon, springing in from `scale: 0.5` to `scale: 1` with `withSpring(1, { duration: 500, dampingRatio: 0.65 })`. This intentionally sits outside the usual 0.9–0.97 "subtle UI" scale range (AUDIT.md §3) — AUDIT.md §1's frequency table explicitly grants rare/first-time moments the fuller delight treatment, and §8 calls out exactly this kind of moment ("rendered with none of the delight budget they're allowed") as the finding to fix. It still respects the hard "never `scale(0)`" rule: 0.5, not 0.
- "Nice work!" text (`Text variant="h2"`, matching the app's established encouraging tone — `DESIGN.MD` and `home.tsx`'s "Every set counts." caption both use this voice) fading and sliding up 8px→0, staggered 100ms after the icon starts (AUDIT.md §7: everything-at-once entrances should stagger).
- A single success haptic on mount: `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)`.
- Auto-advances after 1400ms (900ms if reduced motion is on); tapping anywhere advances immediately. Whichever happens first calls `onDone` exactly once.
- Reduced motion: per AUDIT.md §6 ("fewer and gentler, not zero") — skip the spring/fade movement entirely (render at final state), keep the haptic, and use the shorter 900ms dwell so the moment still registers before advancing.
- The overlay's own entrance/exit uses the codebase's existing convention: `FadeIn.duration(200).reduceMotion(ReduceMotion.System)` / `FadeOut.duration(150).reduceMotion(ReduceMotion.System)` (see Repo conventions below) — the container fades in/out; the icon+text choreography above happens inside it.

Colors and text come from `src/lib/theme.ts`'s `THEME` object via `useColorScheme()` — **not** Tailwind `className`, because `chart1`–`chart5` are defined in `THEME`/`global.css` but were never added to `tailwind.config.js`'s `colors` map (confirmed by reading the file — only `border/input/ring/background/foreground/primary/secondary/destructive/muted/accent/popover/card` are registered). Adding them to the Tailwind config is out of scope for this plan (see Boundaries) — use the same direct-`THEME`-token technique already used in `src/app/(tabs)/_layout.tsx` and `src/app/(tabs)/dashboard.tsx`'s calendar theming instead.

## Repo conventions to follow

- Reanimated layout-animation builders chained with `.duration(ms)` and `.reduceMotion(ReduceMotion.System)` are the established convention for entrance/exit — see `src/components/ui/dialog.tsx:59-61` (`FadeIn.duration(200).reduceMotion(ReduceMotion.System)` / `FadeOut.duration(150)...`). Reuse the exact same durations for this overlay's own fade.
- `withSpring(value, { duration, dampingRatio })` is the established spring config shape in this codebase (not `damping`/`mass`/`stiffness`) — see `src/components/ui/sheet.tsx`'s drag-release spring: `withSpring(0, { duration: 500, dampingRatio: 0.8 })`. This plan's icon spring reuses the same `duration: 500` but a lower `dampingRatio: 0.65` for a more visible, celebratory bounce (still within the accepted "keep bounce subtle" range for a delight-tier moment, not the drag-release's more restrained one).
- `Animated.createAnimatedComponent(Pressable)` is already a proven pattern in this exact codebase — see `src/components/ui/native-only-animated-view.tsx:5` (`const AnimatedPressable = Animated.createAnimatedComponent(Pressable);`). Reuse this one-line technique locally in the new file so the tap-to-dismiss surface is a real `Pressable` (correct touch semantics, matches every other tappable surface in the app) that can still carry `entering`/`exiting` props.
- The `Icon` wrapper (`src/components/ui/icon.tsx`) accepts an explicit `color` prop that overrides its default `className`-driven color — already relied on for the tab bar icons (`src/app/(tabs)/_layout.tsx`, `tabIcon` helper) where the color is a runtime value, not a Tailwind class. Use the same technique here.
- `useReducedMotion()` (reanimated) + branching shared-value initial values and animation calls is the established reduced-motion pattern — see `src/features/workouts/components/WorkoutSetRow.tsx`'s `reducedMotion` guard around its own `withSequence` pop.

## Steps

1. **Create `src/features/workouts/components/WorkoutCompleteCelebration.tsx`** with this exact content:

   ```tsx
   import * as Haptics from "expo-haptics";
   import { Check } from "lucide-react-native";
   import { useEffect, useRef } from "react";
   import { Pressable, useColorScheme } from "react-native";
   import Animated, {
     FadeIn,
     FadeOut,
     ReduceMotion,
     useAnimatedStyle,
     useReducedMotion,
     useSharedValue,
     withDelay,
     withSpring,
     withTiming,
   } from "react-native-reanimated";

   import { Icon } from "@/components/ui/icon";
   import { Text } from "@/components/ui/text";
   import { THEME } from "@/lib/theme";

   const AUTO_DISMISS_MS = 1400;
   const REDUCED_MOTION_DISMISS_MS = 900;

   const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

   type WorkoutCompleteCelebrationProps = {
     /** Called exactly once, whether dismissed by tap or by the auto-dismiss timer. */
     onDone: () => void;
   };

   export function WorkoutCompleteCelebration({ onDone }: WorkoutCompleteCelebrationProps) {
     const scheme = useColorScheme();
     const colors = THEME[scheme ?? "light"];
     const reducedMotion = useReducedMotion();

     const iconScale = useSharedValue(reducedMotion ? 1 : 0.5);
     const textOpacity = useSharedValue(reducedMotion ? 1 : 0);
     const textTranslateY = useSharedValue(reducedMotion ? 0 : 8);

     const hasFinishedRef = useRef(false);
     const finish = () => {
       if (hasFinishedRef.current) return;
       hasFinishedRef.current = true;
       onDone();
     };

     useEffect(() => {
       void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

       if (!reducedMotion) {
         iconScale.value = withSpring(1, { duration: 500, dampingRatio: 0.65 });
         textOpacity.value = withDelay(100, withTiming(1, { duration: 200 }));
         textTranslateY.value = withDelay(100, withTiming(0, { duration: 200 }));
       }

       const timer = setTimeout(finish, reducedMotion ? REDUCED_MOTION_DISMISS_MS : AUTO_DISMISS_MS);
       return () => clearTimeout(timer);
       // Intentionally runs once on mount only — re-running on shared-value/finish identity
       // changes would restart the timer and re-fire the haptic.
       // eslint-disable-next-line react-hooks/exhaustive-deps
     }, []);

     const iconStyle = useAnimatedStyle(() => ({
       transform: [{ scale: iconScale.value }],
     }));
     const textStyle = useAnimatedStyle(() => ({
       opacity: textOpacity.value,
       transform: [{ translateY: textTranslateY.value }],
     }));

     return (
       <AnimatedPressable
         onPress={finish}
         entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)}
         exiting={FadeOut.duration(150).reduceMotion(ReduceMotion.System)}
         style={{
           position: "absolute",
           top: 0,
           left: 0,
           right: 0,
           bottom: 0,
           alignItems: "center",
           justifyContent: "center",
           gap: 16,
           backgroundColor: colors.background,
         }}
       >
         <Animated.View
           style={[
             iconStyle,
             {
               width: 96,
               height: 96,
               borderRadius: 48,
               backgroundColor: colors.chart2,
               alignItems: "center",
               justifyContent: "center",
             },
           ]}
         >
           <Icon as={Check} size={48} strokeWidth={3} color={colors.primaryForeground} />
         </Animated.View>
         <Animated.View style={textStyle}>
           <Text variant="h2">Nice work!</Text>
         </Animated.View>
       </AnimatedPressable>
     );
   }
   ```

2. **In `src/app/workout/active.tsx`**, add local state for the overlay near the other `useState` calls (after `const [noExerciseAlertOpen, setNoExerciseAlertOpen] = useState(false);` at line 35):

   ```tsx
   const [celebrating, setCelebrating] = useState(false);
   ```

3. **Add the import** near the other feature-component imports (after `import { WorkoutTimerHeader } from "@/features/workouts/components/WorkoutTimerHeader";` at line 20):

   ```tsx
   import { WorkoutCompleteCelebration } from "@/features/workouts/components/WorkoutCompleteCelebration";
   ```

4. **Replace the three completion call sites** (lines 146–178) with a single shared helper plus the three paths routed through it:

   ```tsx
   const finishAndCelebrate = async (finish: () => Promise<void>) => {
     await finish();
     setCelebrating(true);
   };

   const onComplete = async () => {
     await flushPendingSetUpdates();

     if (!canComplete) {
       setNoExerciseAlertOpen(true);
       return;
     }

     const hasIncompleteSets = activeWorkout.exercises.some((exercise) =>
       exercise.sets.some((set) => set.isCompleted === 0),
     );

     if (!hasIncompleteSets) {
       await finishAndCelebrate(() => completeWorkout(activeWorkout.id));
       return;
     }

     setIncompleteSetsDialogOpen(true);
   };

   const onKeepAllSetsAndComplete = async () => {
     setIncompleteSetsDialogOpen(false);
     await finishAndCelebrate(() => completeWorkout(activeWorkout.id));
   };

   const onRemoveIncompleteSetsAndComplete = async () => {
     setIncompleteSetsDialogOpen(false);
     await finishAndCelebrate(async () => {
       await removeIncompleteSets(activeWorkout.id);
       await completeWorkout(activeWorkout.id);
     });
   };
   ```

   Note what did **not** change: `onCancel` (line 180) keeps its own direct `router.replace("/(tabs)/home")` untouched — canceling is not a success moment and must not celebrate.

5. **Render the overlay as a sibling of `CustomScreen`, not a child of it.** `CustomScreen`'s `scroll` mode (`src/components/common/CustomScreen.tsx`) wraps its children in a `ScrollView`; `position: "absolute", inset-style top/left/right/bottom: 0` inside a `ScrollView`'s content only covers the content's own height, not the full visible viewport, if the content is shorter than the screen. Change the component's `return` (currently `return (<CustomScreen scroll ...>...</CustomScreen>);` at line 186) to wrap both in a fragment, with the overlay rendered after `CustomScreen` closes:

   ```tsx
   return (
     <>
       <CustomScreen scroll contentContainerStyle={{ gap: 16, paddingBottom: 32 }}>
         {/* ...existing screen content, unchanged... */}
       </CustomScreen>

       {celebrating ? (
         <WorkoutCompleteCelebration onDone={() => router.replace("/(tabs)/home")} />
       ) : null}
     </>
   );
   ```

   Everything currently inside `<CustomScreen>...</CustomScreen>` (the timer header, action buttons, exercise list, sheets, and the three existing dialogs) stays exactly as it is — only the wrapping fragment and the new sibling overlay are added.

## Boundaries

- Do NOT add `chart1`–`chart5` to `tailwind.config.js`. Read the color directly from `THEME` via `useColorScheme()`, as specified above.
- Do NOT touch `onCancel` or the "Cancel Workout" `ConfirmDialog` — this plan is scoped to the three *success* paths only.
- Do NOT add a confetti/particle library. No such dependency exists in `package.json`, and adding one is a dependency decision beyond this plan's remit — the checkmark + spring + haptic is the intended full scope of the celebration.
- Do NOT change what `completeWorkout`, `removeIncompleteSets`, or any repository/hook function does — this plan only changes when navigation happens relative to those calls, never their behavior.
- If `src/app/workout/active.tsx` has drifted from the line numbers/code cited above since commit `9bd106c`, STOP and report the mismatch instead of guessing where to splice in the changes.

## Verification

- **Mechanical**: `npx tsc --noEmit` from the repo root — expect no errors. This project cannot run its web preview (expo-sqlite breaks on web) and the maintainer has asked that the app not be launched to test — do not attempt `expo start`; rely on `tsc` and, if available, `npx expo export --platform ios --output-dir <tmp-dir>` to confirm the bundle still compiles, then delete the temp output dir.
- **Feel check** (when next run on a device/simulator):
  - Complete a workout with all sets marked done → the overlay should appear immediately after the button press with no visible gap, the checkmark should visibly overshoot slightly past full size before settling (that's the `dampingRatio: 0.65` bounce), and "Nice work!" should fade/slide in about 100ms after the checkmark starts, not simultaneously.
  - Tap the overlay early → it should dismiss and navigate to Home immediately, not wait for the full 1400ms.
  - Let it run its course untouched → it should navigate to Home on its own around 1.4s later.
  - Complete a workout via "Keep all sets" and again via "Remove incomplete sets" (the two branches off the incomplete-sets `AlertDialog`) → both should show the identical celebration, confirming the shared `finishAndCelebrate` path works for all three completion routes.
  - Cancel a workout instead of completing it → confirm no celebration appears.
  - Enable "Reduce Motion" in device accessibility settings, then complete a workout → the checkmark and text should appear instantly at full opacity/scale (no spring, no stagger), the haptic should still fire, and it should advance to Home after roughly 0.9s instead of 1.4s.
- **Done when**: all three completion paths show the celebration exactly once each, cancel shows nothing, tap-to-skip and auto-dismiss both navigate to Home exactly once (never twice), and reduced motion drops the movement but keeps the haptic and a shorter dwell.
