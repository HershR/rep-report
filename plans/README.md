# Animation plans — rep-report

Plans produced by `improve-animations plan <description>` for: "Implement a celebration/positive user feedback when the user completes a workout or a set." Each plan is fully self-contained — see the individual files for exact code, values, and verification steps. Execute with `improve-animations execute <plan>` or hand the file to any agent.

| # | Title | Severity | Status |
| --- | --- | --- | --- |
| [001](001-workout-complete-celebration.md) | Add a celebration moment when a workout is completed | N/A (missed opportunity) | SUPERSEDED — see note below |
| [002](002-set-complete-haptic.md) | Add a haptic tick when a set is marked complete | N/A (missed opportunity) | TODO |

## Recommended execution order

**002 first, then 001.** No hard dependency between them — they touch different files (`WorkoutSetRow.tsx` vs. `active.tsx` + a new `WorkoutCompleteCelebration.tsx`) — but 002 is a ~5-line, low-risk addition to an already-shipped animation, a good warm-up before 001's larger new-component + control-flow change. Both can also be executed in parallel by different agents with no conflict.

## Context for whoever picks these up

- The visual "set complete" pop (button scale on Mark→Done) already shipped before these plans were written — 002 only adds the haptic tick alongside it. Don't re-implement the pop.
- **001 is superseded.** It was executed as written (a full-screen blocking overlay), then replaced per direct user request: the overlay intercepted all touches, so it was swapped for a non-blocking `sonner-native` toast (`toast.success("Nice work!", ...)`) fired from the same `finishAndCelebrate` helper in `src/app/workout/active.tsx`. `WorkoutCompleteCelebration.tsx` no longer exists. Don't re-implement the full-screen version from 001's original spec — treat that file as historical record only.
- Both plans were written against commit `9bd106c`. If the target files have moved on since, treat the cited line numbers as approximate and re-locate the exact code blocks quoted verbatim in each plan's "Problem"/"Steps" sections before editing.
- This app cannot run its web preview (expo-sqlite breaks on web) and should not be launched to test per the maintainer's standing instruction — verify with `tsc --noEmit` and, if needed, a static `expo export`. Device/simulator feel-checks (haptics, spring bounce) are listed in each plan but can only actually be performed by someone with a device in hand.
