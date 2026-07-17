# Animation Opportunities — Rep Report

A restraint-first sweep for motion that would *genuinely* help. Most candidates were rejected (see Part 2) — this is a filter, not a wishlist.

## Recon notes (read before the recipes)

**This is a React Native + Reanimated app, not web.** The `find-animation-opportunities` skill's default recipes (`@starting-style`, `clip-path`, CSS `--ease-*` cubic-bezier tokens, `transition:` declarations) **do not exist in this stack** and are not used below. The recipes here extend the project's *actual* motion vocabulary:

- **`react-native-reanimated` ~4.1.1** layout-animation builders — `FadeIn` / `FadeOut` / `SlideInDown` / `SlideOutDown`, chained with `.duration(ms)` and `.reduceMotion(ReduceMotion.System)`. These already live in `src/components/ui/{alert-dialog,dialog,sheet}.tsx` and nowhere else.
- **`react-native-gesture-handler` ~2.28** (installed, currently unused for custom gestures).
- **NativeWind `active:` variants** for press states (applied *instantly* by RN's `Pressable`, not eased — the platform-idiomatic press feedback).
- **Existing duration band:** fades 150–220ms, sheet slide 180–220ms. New suggestions stay in that band.
- **Reduced motion:** the repo convention is `.reduceMotion(ReduceMotion.System)` on builders; for imperative `withTiming`/`withSpring` (press scale, set pop, drag) guard with reanimated's `useReducedMotion()` and soften/skip.

**Product personality:** beginner-friendly, Strong-inspired workout tracker; `DESIGN.MD` §3 explicitly calls for "rewarding completed actions" and an encouraging tone. That earns a modestly more generous delight budget than a dashboard — but the data-entry surfaces (set logging) are functional and get restraint.

---

## Part 1 — Opportunities

| # | Location | Today | Purpose | Frequency | Suggested motion |
| --- | --- | --- | --- | --- | --- |
| 1 | `ExerciseCard.tsx:29`, `TemplateCard.tsx:21` | Tap rows have **no press state** — while `dashboard.tsx:70` rows already use `active:opacity-80`. Inconsistent. | Feedback | Tens/day | Add `active:opacity-80` to each row `Pressable` to match the dashboard pattern. Near-imperceptible, zero deps, fixes the inconsistency. *(Optional more-tactile variant: wrap in a Reanimated pressable scaling to `0.97` via `withTiming(v,{duration:120})`, guarded by `useReducedMotion()`.)* |
| 2 | `home.tsx:58` (skeleton→buttons), `exercise/[exerciseId].tsx:103` (spinner→card), `profile.tsx` card bodies, `search.tsx` results | Loaded content **replaces** the skeleton/spinner instantly — a hard swap. | Preventing a jarring change | Occasional | Wrap the resolved-content branch in `<Animated.View entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)}>`. Same builder + reduced-motion convention already in the dialog/sheet files. Bridges the loading→loaded swap the skeletons already set up. |
| 3 | `sheet.tsx` (drives `AddSavedExerciseSheet`, `ExerciseFilterModal`) | Bottom sheet dismisses only via backdrop tap / X button (`sheet.tsx:38-41`). No swipe. | Spatial consistency / gesture | Occasional | Add a `Gesture.Pan()` on `SheetContent`: follow finger on `translateY` (down only, rubber-band up), dismiss on velocity `>~0.5px/ms` **or** drag past ~30% height, else spring back: `withSpring(0,{ duration: 0.5, bounce: 0.2 })`. Matches the platform expectation for a bottom sheet. Higher effort — one central change in `sheet.tsx`. |
| 4 | `dialog.tsx:80`, `alert-dialog.tsx` content | On **native** the dialog card only inherits the overlay's `FadeIn` — it never scales. Web gets `zoom-in-95` (`dialog.tsx` content className), native gets nothing. | Spatial consistency | Occasional | Give the content its own entrance via a reanimated `Keyframe` `{opacity:0, transform:[{scale:0.95}]}` → `{opacity:1, transform:[{scale:1}]}`, `.duration(200).reduceMotion(ReduceMotion.System)`. Brings native to parity with web; subtle scale-from-center. Affects every `ConfirmDialog`/`AlertDialog`/`Dialog` at once. |
| 5 | `WorkoutSetRow.tsx` (Mark → Done button) | Marking a set complete flips the button variant (outline→default) with no motion. | Feedback + Delight (`DESIGN.MD` §3 "rewarding completed actions") | Tens/day *during a session* | On transition to Done only, a tiny fast pop on the button: `withSequence(withTiming(1.06,{duration:80}), withTiming(1,{duration:100}))` on `scale`. Keep it this subtle — it fires often. Guard with `useReducedMotion()` (skip the pop, keep the color change). This is the app's signature reward beat; the frequency caveat is why it's ranked last, not omitted. |

All recipes animate `transform`/`opacity` only, stay ≤220ms, and carry reduced-motion handling.

---

## Part 2 — Rejected candidates (deliberately no animation)

- **Tab bar transitions** (`(tabs)/_layout.tsx`) — core navigation, 100+/day. **Rejected: keyboard/nav-frequency tier. Never animate.**
- **FlashList per-item entrance** (search results `search.tsx`, saved list `saved.tsx`) — **Rejected: function/perf.** FlashList recycles cells; per-item `entering` animations fight recycling and jank on scroll. The list is also functional content the user scans.
- **Live workout timer** (`WorkoutTimerHeader.tsx`, elapsed seconds, ticks every 1s) — **Rejected: function + frequency.** Data the user reads; animating the number every second is noise, not feedback.
- **Small-list stagger** (home templates `home.tsx`, dashboard workout `.map`) — **Rejected: purpose/leverage.** Decorative only, lists are tiny (≤3 templates), and #2's fade already covers the appearance. Stagger here is polish for polish's sake.
- **Workout-completion celebration** (`active.tsx` → `router.replace("/(tabs)/home")`) — **Rejected: scope + repetition.** The genuine delight moment, but it currently just navigates away; a celebration would require building a new success surface (out of this skill's "animate existing moments" remit), and confetti on a several-times-a-week action turns gimmicky fast.
- **Skeleton pulse** — already animates (`animate-pulse` in `skeleton.tsx`). Not a gap.

---

## Part 3 — Verdict

This interface needs **little** motion, and it's already closer to right than most — the overlay/sheet primitives animate correctly and nothing is over-animated. The gaps are the un-bridged *seams* between states, not missing flourish. Highest-leverage single change: **#1, press feedback on the card rows** — it's the primary tap target across Search and Saved, the fix is one NativeWind class per component, and it removes a real inconsistency with the dashboard rows that already respond. After that, **#2 (load-swap fades)** is the best ratio of felt-quality to effort. Treat #3 (swipe-dismiss) and #5 (set-completion pop) as deliberate, scoped bets, not defaults.

To turn any row into a self-contained implementation plan: `improve-animations plan <suggestion>`.
