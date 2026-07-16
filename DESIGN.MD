# Rep Report — Cursor-Ready App Design Document

## 1. Product Summary

Rep Report is an Expo React Native workout tracking app inspired by apps like Strong, but designed specifically for beginners starting their fitness journey. The app should feel simple, encouraging, and low-friction. Users should be able to search exercises, save favorites, build workouts, start active workout sessions, log sets/reps/time/weight, review workout history, and track body measurements.

The app is local-first. All core data should work offline and be stored on the user's device using SQLite. Cloud sync is a future feature and should not be required for the MVP. The architecture should still be designed so cloud sync can be added later without rewriting the app.

## 2. Core Goals

### 2.1 MVP Goals

The first production-quality version should support:

- Beginner-friendly onboarding and profile setup.
- Exercise search using the WGER API.
- Local storage of favorited exercises.
- Saved/favorite exercise management.
- Workout template creation and editing.
- Starting and completing workout sessions.
- Logging exercise sets using reps, weight, time, or distance where applicable.
- Viewing workout history by date.
- Tracking body measurements over time.
- Offline access to locally saved exercises, templates, workout history, and measurements.

### 2.2 Future Goals

Future versions may add:

- Cloud sync.
- User accounts.
- Exercise library pre-download.
- Progress charts and insights.
- Personal records.
- Workout scheduling.
- Rest timers.
- Plate calculator.
- Supersets.
- RPE/RIR tracking.
- AI-based recommendations.

## 3. Target User Experience

The app is for beginners, so the interface should reduce intimidation. Avoid dense screens, overly technical terminology, and advanced controls unless they are optional.

Design principles:

- Use clear language: “Start Workout”, “Add Exercise”, “Log Set”.
- Prefer progressive disclosure: show basic fields first, advanced fields later.
- Make empty states helpful and encouraging.
- Make completed actions feel rewarding.
- Make editing forgiving.
- Keep navigation shallow.
- Prioritize fast local interactions.

## 4. Recommended Tech Stack

### 4.1 App Framework

Use:

- Expo SDK 54
- React Native
- TypeScript
- Expo Router
- React Hook Form
- Zod
- TanStack Query
- Expo SQLite
- Drizzle ORM
- Zustand or React Context for lightweight UI/session state

### 4.2 Styling

- Stylesheets

### 4.3 Local Database

Use:

- `expo-sqlite`
- `drizzle-orm`
- `drizzle-kit`

SQLite should be the source of truth for user-created and user-saved data.

### 4.4 Remote Data

Use WGER API for exercise search.

For MVP:

- Fetch exercises from WGER on demand.
- Normalize the remote exercise data before storing anything locally.
- Store only favorited/saved exercises locally.
- Cache recent search results optionally, but do not treat the cache as permanent user data.

Future:

- Host a curated subset of WGER exercise data.
- Download/update that subset locally.

### 4.5 State Management

Use a layered approach:

- SQLite/Drizzle for persistent app data.
- TanStack Query for remote WGER requests and async local queries if helpful.
- Zustand for temporary active workout session state, timers, selected filters, and UI state.
- React Hook Form + Zod for form validation.

Avoid storing persistent domain data only in Zustand. Persistent data should be saved to SQLite.

## 5. Project Structure

Use Expo Router with a clean feature-based architecture.

```txt
rep-report/
    src/
    app/
        _layout.tsx
        index.tsx
        (tabs)/
        _layout.tsx
        home.tsx
        search.tsx
        dashboard.tsx
        saved.tsx
        profile.tsx
        workout/
        active.tsx
        new.tsx
        [workoutId].tsx
        template/[templateId].tsx
        exercise/
        [exerciseId].tsx
        measurements/
        index.tsx
        new.tsx
    components/
    common/
    exercise/
    workout/
    measurements/
    db/
    client.ts
    schema.ts
    migrations/
    seed.ts
    features/
    exercises/
        api/
        components/
        hooks/
        repositories/
        types.ts
    workouts/
        components/
        hooks/
        repositories/
        types.ts
    templates/
        components/
        hooks/
        repositories/
        types.ts
    measurements/
        components/
        hooks/
        repositories/
        types.ts
    profile/
        components/
        hooks/
        repositories/
        types.ts
    lib/
    dates.ts
    ids.ts
    validation.ts
    formatters.ts
    services/
    wger/
        client.ts
        mappers.ts
        types.ts
    stores/
    activeWorkoutStore.ts
    theme/
    colors.ts
    spacing.ts
    typography.ts
    index.ts
    types/
    common.ts
```

## 6. Navigation Design

Use bottom tabs for the main app:

1. Home
2. Search
3. Dashboard
4. Saved
5. Profile

Additional screens should be pushed onto the stack:

- Exercise detail
- Active workout
- Create/edit workout template
- Workout detail
- Measurement entry

### 6.1 Home Tab

Purpose:

Give the user a simple, motivating landing page.

Content:

- Greeting.
- Encouraging message.
- Today’s scheduled workout if scheduling exists.
- Quick start workout button.
- Resume active workout button if one is in progress.
- Recent stats:
  - Workouts completed this week.
  - Current streak.
  - Last workout.

MVP note:

Workout scheduling can be deferred. If scheduling is not built yet, show quick start and recent workout summary.

### 6.2 Search Tab

Purpose:

Let users discover exercises.

Features:

- Search input.
- Filters:
  - Keyword.
  - Category.
  - Equipment.
  - Muscle group.

- Exercise results list.
- Exercise detail page.
- Favorite/save action.

WGER integration:

- Query WGER exercise endpoints.
- Prefer English exercise names/descriptions.
- Strip HTML from descriptions.
- Normalize equipment/muscle/category values.
- Handle missing images gracefully.

### 6.3 Dashboard Tab

Purpose:

Show workout history by date.

Features:

- Calendar/date selector.
- List of workouts completed on selected date.
- Workout summary card:
  - Workout name.
  - Duration.
  - Exercise list.
  - Total sets.

- Tap workout to view full workout.
- Allow editing completed workout details.

Editing completed workouts:

- Allow editing name, notes, exercises, sets, reps, weight, and time.
- Preserve `completedAt` unless the user explicitly changes the date.

### 6.4 Saved Tab

Purpose:

Manage saved exercises and workout templates.

Sections:

- Saved exercises.
- Workout templates.

Features:

- View favorite exercises.
- Remove exercise from favorites.
- Create workout template.
- Edit workout template.
- Delete workout template.
- Start workout from template.

### 6.5 Profile Tab

Purpose:

Manage user profile and measurements.

Profile fields:

- Display name.
- Age or date of birth. Prefer date of birth if using age calculations.
- Height.
- Current weight.

Measurement tracking:

- Weight.
- Height.
- Optional body measurements:
  - Chest.
  - Waist.
  - Hips.
  - Left/right arm.
  - Left/right thigh.
  - Shoulders.

Important:

Height and weight changes should be stored historically rather than only overwriting the profile.

### 6.6 Graphs/Insights Tab — Future

Do not include this in the main tab bar for MVP unless implemented.

Future insights:

- Workout frequency.
- Volume over time.
- Body weight trend.
- Measurement trends.
- Exercise personal records.
- Muscle group distribution.

## 7. Domain Model

### 7.1 Exercise

An exercise represents either a remote WGER exercise or a locally saved normalized exercise.

Fields:

- `id`: local UUID.
- `wgerExerciseId`: remote WGER ID, nullable.
- `name`: string.
- `description`: string, nullable.
- `category`: string, nullable.
- `equipment`: string array or joined table.
- `primaryMuscles`: string array or joined table.
- `secondaryMuscles`: string array or joined table.
- `imageUrl`: string, nullable.
- `isFavorite`: boolean.
- `source`: `wger` or `custom`.
- `createdAt`: datetime.
- `updatedAt`: datetime.

MVP should support WGER exercises. Custom exercises can be a future feature, but the schema can support them.

### 7.2 Workout Template

A workout template is a reusable workout plan.

Fields:

- `id`: UUID.
- `name`: string.
- `description`: string, nullable.
- `createdAt`: datetime.
- `updatedAt`: datetime.

Template exercise fields:

- `id`: UUID.
- `templateId`: UUID.
- `exerciseId`: UUID.
- `orderIndex`: number.
- `notes`: string, nullable.

Template set target fields:

- `id`: UUID.
- `templateExerciseId`: UUID.
- `orderIndex`: number.
- `targetReps`: number, nullable.
- `targetWeight`: number, nullable.
- `targetDurationSeconds`: number, nullable.
- `targetDistance`: number, nullable.
- `setType`: `normal`, `warmup`, `drop`, `failure`.

### 7.3 Workout Session

A workout session is an actual workout performed by the user.

Fields:

- `id`: UUID.
- `templateId`: UUID, nullable.
- `name`: string.
- `startedAt`: datetime.
- `completedAt`: datetime, nullable.
- `durationSeconds`: number, nullable.
- `notes`: string, nullable.
- `status`: `active`, `completed`, `cancelled`.
- `createdAt`: datetime.
- `updatedAt`: datetime.

Workout session exercise fields:

- `id`: UUID.
- `workoutSessionId`: UUID.
- `exerciseId`: UUID.
- `orderIndex`: number.
- `notes`: string, nullable.

Workout set fields:

- `id`: UUID.
- `workoutExerciseId`: UUID.
- `orderIndex`: number.
- `reps`: number, nullable.
- `weight`: number, nullable.
- `durationSeconds`: number, nullable.
- `distance`: number, nullable.
- `isCompleted`: boolean.
- `setType`: `normal`, `warmup`, `drop`, `failure`.
- `createdAt`: datetime.
- `updatedAt`: datetime.

### 7.4 Profile

Fields:

- `id`: UUID.
- `displayName`: string.
- `dateOfBirth`: date, nullable.
- `createdAt`: datetime.
- `updatedAt`: datetime.

Avoid storing age as the only value because age changes over time. If age is easier for MVP, store it as nullable, but date of birth is better long-term.

### 7.5 Measurements

Fields:

- `id`: UUID.
- `measurementType`: enum/string.
- `value`: number.
- `unit`: string.
- `measuredAt`: datetime.
- `notes`: string, nullable.
- `createdAt`: datetime.
- `updatedAt`: datetime.

Measurement types:

- `weight`
- `height`
- `chest`
- `waist`
- `hips`
- `shoulders`
- `left_arm`
- `right_arm`
- `left_thigh`
- `right_thigh`

### 7.6 App Settings

Fields:

- `id`: UUID.
- `weightUnit`: `lb` or `kg`.
- `distanceUnit`: `mi` or `km`.
- `heightUnit`: `in` or `cm`.
- `themeMode`: `system`, `light`, or `dark`.
- `createdAt`: datetime.
- `updatedAt`: datetime.

## 8. SQLite/Drizzle Schema Recommendation

Cursor should implement the Drizzle schema in `src/db/schema.ts`.

Recommended tables:

- `exercises`
- `exercise_equipment`
- `exercise_muscles`
- `workout_templates`
- `workout_template_exercises`
- `workout_template_sets`
- `workout_sessions`
- `workout_session_exercises`
- `workout_sets`
- `profile`
- `measurements`
- `app_settings`

Use UUID strings for primary keys.

Use ISO strings for dates unless the project chooses integer timestamps consistently. ISO strings are easier to debug; integer timestamps are easier to sort. Pick one convention and use it everywhere.

Recommended convention:

- Store dates as ISO strings in UTC.
- Convert to local time only for display.

## 9. Repository Layer

Create repository files that isolate database operations from UI components.

Examples:

```txt
src/features/exercises/repositories/exerciseRepository.ts
src/features/workouts/repositories/workoutRepository.ts
src/features/templates/repositories/templateRepository.ts
src/features/measurements/repositories/measurementRepository.ts
src/features/profile/repositories/profileRepository.ts
```

Repositories should expose functions like:

```ts
createWorkoutTemplate(input);
updateWorkoutTemplate(id, input);
deleteWorkoutTemplate(id);
getWorkoutTemplateById(id);
listWorkoutTemplates();

startWorkout(input);
completeWorkout(id);
cancelWorkout(id);
addExerciseToWorkout(workoutId, exerciseId);
addSetToWorkoutExercise(workoutExerciseId, input);
updateWorkoutSet(setId, input);
```

Do not put raw SQL inside screens.

## 10. WGER API Design

Create a WGER service layer:

```txt
src/services/wger/client.ts
src/services/wger/types.ts
src/services/wger/mappers.ts
```

Responsibilities:

- Fetch exercises.
- Fetch categories.
- Fetch muscles.
- Fetch equipment.
- Normalize WGER data into app-friendly objects.
- Strip HTML from exercise descriptions.
- Handle pagination.
- Handle missing data.

The UI should not depend directly on WGER response shapes.

### 10.1 WGER Search Flow

1. User enters search/filter criteria.
2. Search screen calls a hook like `useExerciseSearch(filters)`.
3. Hook uses TanStack Query.
4. Query function calls WGER client.
5. WGER mapper converts remote response into `ExerciseSearchResult`.
6. UI displays normalized result cards.
7. If user favorites an exercise:
   - Save normalized exercise to SQLite.
   - Mark `isFavorite = true`.
   - Store the WGER ID to prevent duplicates.

### 10.2 Duplicate Prevention

When favoriting WGER exercises:

- Check if `wgerExerciseId` already exists locally.
- If yes, update `isFavorite = true`.
- If no, insert a new local exercise.

## 11. Active Workout Flow

### 11.1 Start Empty Workout

Flow:

1. User taps “Start Workout”.
2. App creates a `workout_sessions` row with `status = active`.
3. App navigates to active workout screen.
4. User adds exercises.
5. User logs sets.
6. User completes workout.
7. App sets `completedAt`, `durationSeconds`, and `status = completed`.

### 11.2 Start From Template

Flow:

1. User selects workout template.
2. User taps “Start”.
3. App creates workout session from template.
4. Template exercises become workout session exercises.
5. Template target sets become initial workout sets.
6. User modifies actual values as needed.
7. User completes workout.

### 11.3 Active Workout State

The active workout should be recoverable if the app closes.

Do not keep the active workout only in memory.

Recommended approach:

- Persist the active workout session to SQLite immediately.
- Use Zustand only for temporary UI state like selected exercise, timer display, unsaved input focus state, and optimistic UI.
- On app launch, check for any `status = active` workout.
- Show “Resume Workout” on Home if active workout exists.

### 11.4 Completing a Workout

When completing:

- Validate that the workout has at least one exercise.
- Allow completion with incomplete sets, but ask the user whether to remove incomplete sets or keep them.
- Set `completedAt` to current time.
- Calculate duration from `startedAt` unless manually overridden.
- Save all set changes.

## 12. Form Validation

Use Zod schemas for:

- Profile form.
- Measurement form.
- Workout template form.
- Workout set input.
- Exercise search filters.

Validation examples:

- Workout name cannot be empty.
- Reps must be zero or greater.
- Weight must be zero or greater.
- Duration must be zero or greater.
- Measurement value must be greater than zero.
- Height and weight units must be valid enum values.

## 13. UI Components

### 13.1 Common Components

Create reusable components:

- `AppScreen`
- `AppText`
- `AppButton`
- `AppIconButton`
- `AppCard`
- `EmptyState`
- `LoadingState`
- `ErrorState`
- `ConfirmDialog`
- `TextField`
- `NumberField`
- `SelectField`

### 13.2 Exercise Components

- `ExerciseCard`
- `ExerciseSearchBar`
- `ExerciseFilterSheet`
- `ExerciseFavoriteButton`
- `ExerciseDetailHeader`

### 13.3 Workout Components

- `WorkoutSummaryCard`
- `WorkoutExerciseBlock`
- `WorkoutSetRow`
- `WorkoutTimerHeader`
- `AddExerciseSheet`
- `TemplateCard`

### 13.4 Measurement Components

- `MeasurementEntryForm`
- `MeasurementHistoryList`
- `MeasurementSummaryCard`

## 14. UX Details

### 14.1 Empty States

Examples:

Home:

“Ready for your first Rep Report? Start a workout and log your first set.”

Saved exercises:

“No saved exercises yet. Search for exercises and tap the heart to save your favorites.”

Dashboard:

“No workouts logged for this date.”

Templates:

“No workout templates yet. Create one to make starting workouts faster.”

### 14.2 Beginner-Friendly Copy

Use encouraging labels:

- “Nice work!” after completing a workout.
- “You showed up today.”
- “Every set counts.”
- “Build your first workout.”

Avoid shame-based messages.

### 14.3 Error Handling

For WGER errors:

- Show friendly message.
- Allow retry.
- Continue showing locally saved exercises where possible.

For local DB errors:

- Show generic error message.
- Log details in development.
- Avoid crashing where possible.

## 15. Offline-First Behavior

The app should work without internet for:

- Viewing saved exercises.
- Viewing workout templates.
- Starting workouts from saved templates.
- Logging active workouts.
- Viewing workout history.
- Editing profile.
- Adding measurements.

The app needs internet for:

- Searching WGER exercises.
- Fetching new remote exercise details.

Future cloud sync should be built on top of local data, not replace it.

## 16. Future Cloud Sync Architecture

Prepare for sync by including:

- Stable UUIDs for local records.
- `createdAt` and `updatedAt` on all mutable tables.
- Optional future `deletedAt` soft-delete fields.
- Optional future `syncStatus` field:
  - `synced`
  - `pending_create`
  - `pending_update`
  - `pending_delete`

- Optional future `remoteId` field.

Do not implement cloud sync in MVP unless explicitly requested.

## 17. Data Ownership Rules

### 17.1 Exercise Data

Remote WGER data is reference data.

If the user favorites an exercise, save a local copy so the app still works offline.

### 17.2 Workout Data

Workout sessions and sets are user-owned data.

Never delete completed workouts automatically.

### 17.3 Template Data

Templates are user-owned data.

Deleting a template should not delete completed workouts created from that template.

### 17.4 Measurement Data

Measurements are user-owned historical records.

Updating current weight or height should add a new measurement record rather than destroying history.

## 18. Date and Time Rules

Use UTC internally.

Display dates in the device's local timezone.

Recommended utilities:

- `date-fns` or `luxon`.

Rules:

- `startedAt`, `completedAt`, `createdAt`, `updatedAt`, and `measuredAt` should be stored consistently.
- Dashboard date filtering should use local calendar days.
- Workout duration should be calculated using timestamps, not a timer counter alone.

## 19. Testing Strategy

### 19.1 Unit Tests

Test:

- WGER mappers.
- Date utilities.
- Unit conversion utilities.
- Zod validation schemas.
- Repository functions where practical.

### 19.2 Component Tests

Test:

- Exercise cards.
- Workout set rows.
- Measurement forms.
- Empty states.

### 19.3 Manual QA Checklist

Before considering MVP complete, manually verify:

- User can search exercises.
- User can favorite an exercise.
- Favorited exercises persist after app restart.
- User can create a workout template.
- User can start a workout from scratch.
- User can start a workout from template.
- User can add sets and complete a workout.
- Completed workout appears on Dashboard for the correct date.
- User can edit completed workout.
- User can add weight/height measurements.
- App works when offline except remote search.
- Active workout can be resumed after app restart.

## 20. Accessibility Requirements

Implement:

- Accessible labels for buttons.
- Large enough touch targets.
- Proper text contrast.
- Support for dynamic font sizes where possible.
- Keyboard-friendly forms.
- Clear error messages near form fields.

## 21. Performance Requirements

The app should:

- Avoid unnecessary global re-renders.
- Use FlashList or FlatList for long lists.
- Debounce exercise search input.
- Paginate WGER results.
- Avoid loading large remote datasets at startup.
- Keep database queries scoped and indexed.

Recommended indexes:

- `exercises.wgerExerciseId`
- `exercises.name`
- `workout_sessions.startedAt`
- `workout_sessions.completedAt`
- `measurements.measuredAt`
- `measurements.measurementType`

## 22. Security and Privacy

For MVP:

- Store all user data locally.
- Do not collect sensitive data remotely.
- Do not send workout/measurement data to WGER.

Future cloud sync:

- Require authentication.
- Encrypt data in transit.
- Consider secure storage for auth tokens.
- Provide export/delete account options.

## 23. Cursor Build Plan

Cursor should build the app in stages to reduce context size and avoid messy implementation.

### Stage 1 — Project Foundation

Tasks:

- Set up Expo app with TypeScript.
- Configure Expo Router.
- Add bottom tab navigation.
- Add theme system.
- Add base UI components.
- Set up linting/formatting.
- Add placeholder screens for Home, Search, Dashboard, Saved, and Profile.

Acceptance criteria:

- App starts without errors.
- Bottom tabs navigate correctly.
- Shared theme and base components are usable.

### Stage 2 — Local Database

Tasks:

- Install and configure Expo SQLite and Drizzle.
- Create database client.
- Create schema.
- Add migrations.
- Add repository layer.
- Add basic seed/default app settings.

Acceptance criteria:

- App initializes database on launch.
- Repository functions can create/read/update/delete test records.
- No raw DB logic in screens.

### Stage 3 — Exercise Search and Favorites

Tasks:

- Create WGER client.
- Create WGER types and mappers.
- Build Search screen.
- Add filters.
- Add exercise detail screen.
- Add favorite/save behavior.
- Save favorited exercises locally.

Acceptance criteria:

- User can search remote exercises.
- User can view exercise details.
- User can favorite an exercise.
- Favorite persists offline.
- Duplicate favorites are prevented.

### Stage 4 — Saved Exercises and Templates

Tasks:

- Build Saved screen sections.
- List saved exercises.
- Create workout template CRUD.
- Add exercises to templates.
- Add target sets to template exercises.
- Reorder exercises if practical.

Acceptance criteria:

- User can create/edit/delete templates.
- User can add saved exercises to templates.
- Templates persist after restart.

### Stage 5 — Active Workout Tracking

Tasks:

- Build active workout screen.
- Start empty workout.
- Start workout from template.
- Add/remove exercises.
- Add/update/delete sets.
- Track workout duration.
- Complete/cancel workout.
- Resume active workout after restart.

Acceptance criteria:

- User can complete a workout from scratch.
- User can complete a workout from template.
- Workout duration is saved.
- Workout appears in history.
- Active workout survives app restart.

### Stage 6 — Dashboard History

Tasks:

- Build calendar/date selector.
- List completed workouts by selected date.
- Build workout detail screen.
- Allow editing completed workout.

Acceptance criteria:

- Completed workouts appear on the correct local date.
- User can open full workout details.
- User can edit completed workout data.

### Stage 7 — Profile and Measurements

Tasks:

- Build profile form.
- Build measurement entry form.
- Store height/weight history.
- Show recent measurements.

Acceptance criteria:

- User can update profile.
- User can add weight/height measurements.
- Measurements persist historically.

### Stage 8 — Polish and QA

Tasks:

- Add loading states.
- Add empty states.
- Add error states.
- Add accessibility labels.
- Improve styling.
- Run manual QA checklist.
- Fix edge cases.

Acceptance criteria:

- MVP feels cohesive.
- Main flows work offline.
- No obvious crashes in expected user flows.

## 24. Cursor Rules for This Project

Cursor should follow these rules:

1. Use TypeScript for all app code.
2. Use feature-based folders under `src/features`.
3. Keep screens thin. Screens should compose hooks and components, not contain large business logic.
4. Put database operations in repositories.
5. Put WGER-specific logic in `src/services/wger`.
6. Never directly use WGER response objects in UI components.
7. Use Zod for validation.
8. Use local SQLite as the source of truth for user-owned data.
9. Persist active workouts immediately.
10. Avoid adding cloud sync until the MVP is complete.
11. Write small, focused components.
12. Prefer simple UX over advanced fitness features.
13. Do not introduce large dependencies without a clear reason.
14. Keep styling consistent through shared theme values.
15. Make all dates and units explicit.

## 25. Suggested Environment Setup

Install recommended dependencies:

```bash
npx create-expo-app@latest rep-report --template
cd rep-report
npx expo install expo-sqlite
npm install drizzle-orm drizzle-kit
npm install @tanstack/react-query
npm install zustand
npm install react-hook-form zod @hookform/resolvers
npm install date-fns
```

Optional:

```bash
npm install @shopify/flash-list
npm install react-native-svg
```

Use Expo Router if not already included:

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens react-native-gesture-handler react-native-reanimated
```

## 26. Recommended Cursor Prompt

Use this prompt after adding this document to the project as `DESIGN.md`:

```txt
You are building Rep Report, an Expo React Native workout tracking app. Read DESIGN.md fully before making changes.

Build the app stage by stage. Do not skip ahead. For each stage:
1. Explain the files you will create or modify.
2. Implement the smallest complete version of the stage.
3. Keep screens thin and move domain logic into repositories, hooks, services, and components.
4. Use TypeScript.
5. Use Expo Router.
6. Use SQLite with Drizzle for persistent local data.
7. Use TanStack Query for remote WGER API requests.
8. Use Zod for validation.
9. Do not implement cloud sync yet.
10. After each stage, summarize what was completed and any follow-up tasks.

Start with Stage 1 only.
```

## 27. MVP Non-Goals

Do not build these in the first MVP unless explicitly requested:

- Cloud sync.
- Social features.
- AI workout generation.
- Advanced analytics.
- Wearable integration.
- Nutrition tracking.
- Paid subscriptions.
- Custom hosted exercise database.
- Complex program periodization.

## 28. Definition of Done for MVP

The MVP is done when:

- A new user can open the app and understand what to do.
- The user can search WGER exercises.
- The user can save favorite exercises.
- The user can create workout templates.
- The user can start and complete workouts.
- The user can view workout history by date.
- The user can track weight/height measurements over time.
- The app remains useful offline with saved local data.
- Active workouts are not lost when the app restarts.
- Main flows are stable and beginner-friendly.
