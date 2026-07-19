# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Rep Report — a local-first Expo/React Native workout tracking app for beginners (think Strong, but simpler). All persistent data lives in on-device SQLite via Drizzle ORM; there is no backend and no cloud sync. See `DESIGN.MD` for the full product spec and `TODO.md` for an audit of MVP gaps (many already closed — check the `✅ Done` markers before assuming something is missing).

## Commands

```bash
npx expo start          # JS/Metro dev server — the normal day-to-day loop (press i/a/w, or scan the QR with Expo Go / a dev client)
npm run ios             # `expo run:ios` — full NATIVE build + install of a dev client (needs Xcode); NOT just a dev server
npm run android         # `expo run:android` — full NATIVE build + install of a dev client (needs Android SDK/emulator)
npm run web             # `expo start --web` — NOTE: web is broken, see below
npx tsc --noEmit        # type-check the whole project
npx expo lint           # eslint (eslint-config-expo flat config); also `npm run lint`
npm run format          # prettier --write .
npx drizzle-kit generate   # generate a migration after editing src/db/schema.ts (uses drizzle.config.ts)
```

`npx expo start` is what you normally want — it serves JS over Metro to whatever's already installed (Expo Go or a dev client). Reserve `npm run ios`/`android` for when native code/deps changed and the client binary must be rebuilt; they compile the native project, which is slow. (There's also a `reset-project` script — it scaffolds a blank app and is not part of normal work.)

There is no test framework configured (no jest, no test script in `package.json`) — don't invent one or assume test commands exist.

**Inspecting the DB**: the on-device SQLite database can be browsed live in dev via Drizzle Studio (the `expo-drizzle-studio-plugin` dependency) — open it from the Expo CLI dev-tools menu (`shift+m` in the `expo start` terminal). This is the fastest way to confirm what actually got written to disk (invaluable for data/unit-conversion bugs).

### Verifying changes — read this before testing anything

**`expo-sqlite` does not work on web**, so `npm run web` / the web preview tools cannot be used to test this app — Expo Go on a physical device or simulator is the only way to actually run it. When you can't launch the app yourself, verify changes with:

1. `npx tsc --noEmit` — must be clean.
2. A static `npx expo export --platform ios --output-dir <tmp-dir>` (delete the temp dir after) — confirms the bundle actually compiles, catching issues `tsc` alone won't (e.g. native module resolution).

Be upfront that anything requiring an actual device — animation feel, haptics, gesture behavior, layout on a real screen — is unverified until the user checks it.

**A hard-won gotcha on installing packages**: this project has a peer-dependency conflict between `sonner-native` (wants `react-native-worklets >= 0.6.1`) and the exact worklets version Expo Go's native binary actually ships for this SDK (`0.5.1`, pinned exactly, required by `react-native-reanimated`). Installs of *anything* will trip this ERESOLVE error even when unrelated to worklets. Two consequences:
- You'll need `--legacy-peer-deps` (e.g. `npx expo install <pkg> -- --legacy-peer-deps`) to get past it.
- `--legacy-peer-deps` disables npm's peer-dependency auto-install for the *whole* tree, which can silently drop packages that were only ever present as an auto-installed peer (this happened to `react-native-svg`, an undeclared peer of `lucide-react-native`). After any install that needed `--legacy-peer-deps`, diff `package.json`/run `npm ls` for missing/invalid entries before moving on — don't just assume the tree is still intact.
- Never bump `react-native-worklets` itself to satisfy a peer range — it must stay at the exact version Expo Go's native binary was built against, or the app crashes at runtime with a TurboModule argument-count mismatch. If a new package's peer range conflicts with it, bypass with `--legacy-peer-deps` instead of upgrading worklets.

## Architecture

Imports use the `@/` path alias for `src/` (e.g. `@/features/workouts/...`, `@/lib/units`) — configured in `tsconfig.json`; prefer it over long relative paths.

### Feature-based structure, not layer-based

```
src/features/<feature>/
  components/       # feature-specific UI
  hooks/            # TanStack Query wrappers around repository functions
  repositories/      # all DB access for this feature — the only place raw Drizzle queries live
  types.ts          # domain types (not raw DB row types, not raw WGER response shapes)
```

Features today: `exercises`, `workouts`, `templates`, `profile`, `measurements`.

**Screens (`src/app/**`) stay thin**: they compose components, call hooks, and trigger repository actions via those hooks — no raw SQL, no business logic, no data transformations in a screen file. Route files use Expo Router's file-based conventions (`(tabs)/` group for the bottom nav, `[param]` dynamic routes for detail screens).

**Repository pattern**: DB access is exclusively through named functions in `src/features/*/repositories/*.ts` (e.g. `startWorkout`, `completeWorkout`, `getWorkoutHistory`), each translating between Drizzle row shapes (`src/db/schema.ts`) and the feature's domain types. Hooks (`src/features/*/hooks/*.ts`) wrap these with `useQuery`/`useMutation`, own the query keys, and patch the query cache on mutation success — that's where caching/invalidation logic lives, not in screens or repositories.

**WGER API isolation**: all wger.de API code lives in `src/services/wger/` (`client.ts` does the fetches, `mappers.ts` normalizes raw WGER shapes into the app's own `ExerciseFilterOption`/`ExerciseSearchPage` types, `wgerApiTypes.ts`/`wgerSchema.ts` type the raw responses). UI and repositories never touch raw WGER response shapes directly — only the mapped domain types from `mappers.ts`.

**Active workout persistence**: an in-progress workout (`workoutSessions` status `"active"`) is the source of truth in SQLite the moment it's created — never held only in memory. `useActiveWorkout` (`src/features/workouts/hooks/useActiveWorkout.ts`) is the single hook driving `src/app/workout/active.tsx`; set-field edits are debounced (400ms, see `SET_UPDATE_DEBOUNCE_MS` in `active.tsx`) before committing to the DB, but completion toggles commit immediately. Zustand isn't used for workout data — only for genuinely ephemeral UI/session state if introduced.

### Database (Drizzle + expo-sqlite)

- Schema: `src/db/schema.ts`. Tables: `exercises`, `workoutTemplates` → `workoutTemplateExercises` → `workoutTemplateSets`, `workoutSessions` → `workoutSessionExercises` → `workoutSets`, `profile`, `measurements`, `appSettings`. All mutable tables carry `id` (UUID text), `createdAt`/`updatedAt` (UTC ISO text). Enums (`ExerciseSource`, `SetType`, `WorkoutSessionStatus`, `WeightUnit`/`DistanceUnit`/`HeightUnit`, `ThemeMode`) are defined as `as const` arrays alongside the tables that use them.
- `src/db/client.ts` opens the sqlite connection and wraps it with `drizzle()`; `src/db/init.ts`'s `initializeDatabase()` runs migrations + seeds default `appSettings` and **memoizes its in-flight promise** so concurrent callers don't race a second `migrate()` — reuse that function, don't call `migrate()` directly elsewhere.
- After editing `schema.ts`, generate a migration with `npx drizzle-kit generate` (writes to `src/db/migrations/`, registered in `migrations.js`) — migrations are applied automatically on app start via `initializeDatabase()`.
- Units are stored canonically (km for distance, kg-equivalent internally per `src/lib/units.ts`) and converted only at the display/input boundary based on `appSettings`'s `distanceUnit`/`weightUnit`/`heightUnit` — don't add a second unit-conversion path; extend `src/lib/units.ts`.

### UI system

Built on **React Native Reusables (RNR)** — a shadcn/ui-style component set for RN — plus **NativeWind v4** (`className` styling). Primitives live in `src/components/ui/` (`button`, `card`, `input`, `label`, `text`, `checkbox`, `tabs`, `dialog`, `alert-dialog`, `accordion`, `sheet`, `badge`, `skeleton`, `textarea`, `separator`, `icon`), each thinly wrapping a matching `@rn-primitives/*` headless package with `cva` variants and `cn()` (`src/lib/utils.ts`) for class merging. `src/components/ConfirmDialog.tsx` is an app-level wrapper over `AlertDialog` used for essentially every destructive-action confirmation.

- **Theme**: `src/lib/theme.ts` exports `THEME` (light/dark HSL tokens consumed via NativeWind) and `NAV_THEME` (mapped for `@react-navigation/native`'s `ThemeProvider`) — both driven off `useColorScheme()`, wired once in `src/app/_layout.tsx`. `chart1`–`chart5` tokens exist for future analytics but aren't registered as Tailwind color utilities (`tailwind.config.js`) — read them via `THEME[scheme].chartN` directly in JS/style props, not via `className="text-chart-2"`.
- **`Sheet` (`src/components/ui/sheet.tsx`) is hand-built**, not upstream RNR — RNR has no bottom-sheet component. It's built on `@rn-primitives/dialog` with its own drag-to-dismiss gesture (`react-native-gesture-handler`), and deliberately skips the `FullWindowOverlay` that `Dialog`/`AlertDialog` use (that overlay renders in a separate native window outside `GestureHandlerRootView`, which breaks the swipe gesture).
- **`src/components/common/CustomScreen.tsx`** is the one legacy component that was kept permanently (no RNR equivalent) — every screen wraps its content in `<CustomScreen>`. Everything else that used to live in `src/components/common/` (`CustomButton`/`CustomCard`/`CustomText`, the old `src/theme/*` hex-token system) was migrated away and deleted; see `UIMigration.md`'s Changelog for the full phase-by-phase history if you need archaeology on why something looks the way it does.
- **Animation**: `react-native-reanimated` throughout (`withTiming`/`withSpring`/`FadeIn`/`FadeOut`/etc.), always chained with `.reduceMotion(ReduceMotion.System)`. **NativeWind's `className` interop is not registered for `Animated.View`** — animated components either use inline `style`/`useAnimatedStyle` (not `className`) or go through `src/components/ui/native-only-animated-view.tsx` (`NativeOnlyAnimatedView`), a wrapper that only animates on native and just renders children on web. `src/components/ui/fade-in-view.tsx` is a ready-made fade-in wrapper for list/card entrances. Toasts use `sonner-native` (`<Toaster/>` mounted once in `_layout.tsx`), not a custom overlay. `AnimationOpportunities.md` and `plans/*.md` document specific animation decisions/rationale if you need the reasoning behind a particular value.

### Non-goals (don't add unless explicitly asked)

Cloud sync, user accounts, social features, subscriptions, AI coaching, nutrition tracking, wearable integrations, charts/analytics/personal records. This is an MVP-scoped local workout tracker — check `DESIGN.MD` section 2.2 before assuming a "future goal" should be built now.

### Code style conventions carried over from this project's original ruleset

- Strict TypeScript: explicit types/interfaces, discriminated unions for variants, no `any`.
- Function components only; prefer small components + custom hooks over large screens or deep prop chains.
- Prefer built-in Expo/RN solutions over new dependencies; don't add a library casually (see the peer-dependency gotcha above for why this matters concretely here).
- `FlashList` (not `FlatList`) for any sizable list — see `saved.tsx`'s discriminated-union-rows + `getItemType` pattern for a mixed-content-type list.
