import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestampColumns = {
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
};

export const exercises = sqliteTable(
  "exercises",
  {
    id: text("id").primaryKey().notNull(),
    wgerExerciseId: integer("wger_exercise_id"),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category"),
    equipment: text("equipment"),
    primaryMuscles: text("primary_muscles"),
    secondaryMuscles: text("secondary_muscles"),
    imageUrl: text("image_url"),
    isFavorite: integer("is_favorite").notNull().default(0),
    source: text("source").notNull().default("wger"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("exercises_wger_exercise_id_uidx").on(table.wgerExerciseId),
    index("exercises_name_idx").on(table.name),
  ],
);

export const workoutTemplates = sqliteTable("workout_templates", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  ...timestampColumns,
});

export const workoutTemplateExercises = sqliteTable(
  "workout_template_exercises",
  {
    id: text("id").primaryKey().notNull(),
    templateId: text("template_id")
      .notNull()
      .references(() => workoutTemplates.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    orderIndex: integer("order_index").notNull().default(0),
    notes: text("notes"),
    ...timestampColumns,
  },
  (table) => [index("wte_template_id_idx").on(table.templateId)],
);

export const workoutSessions = sqliteTable(
  "workout_sessions",
  {
    id: text("id").primaryKey().notNull(),
    templateId: text("template_id").references(() => workoutTemplates.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    startedAt: text("started_at").notNull(),
    completedAt: text("completed_at"),
    durationSeconds: integer("duration_seconds"),
    notes: text("notes"),
    status: text("status").notNull().default("active"),
    ...timestampColumns,
  },
  (table) => [
    index("workout_sessions_started_at_idx").on(table.startedAt),
    index("workout_sessions_completed_at_idx").on(table.completedAt),
  ],
);

export const workoutSessionExercises = sqliteTable(
  "workout_session_exercises",
  {
    id: text("id").primaryKey().notNull(),
    workoutSessionId: text("workout_session_id")
      .notNull()
      .references(() => workoutSessions.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    orderIndex: integer("order_index").notNull().default(0),
    notes: text("notes"),
    ...timestampColumns,
  },
  (table) => [index("wse_workout_session_id_idx").on(table.workoutSessionId)],
);

export const workoutSets = sqliteTable(
  "workout_sets",
  {
    id: text("id").primaryKey().notNull(),
    workoutSessionExerciseId: text("workout_session_exercise_id")
      .notNull()
      .references(() => workoutSessionExercises.id, { onDelete: "cascade" }),
    orderIndex: integer("order_index").notNull().default(0),
    reps: integer("reps"),
    weight: real("weight"),
    durationSeconds: integer("duration_seconds"),
    distance: real("distance"),
    isCompleted: integer("is_completed").notNull().default(0),
    setType: text("set_type").notNull().default("normal"),
    ...timestampColumns,
  },
  (table) => [index("workout_sets_wse_id_idx").on(table.workoutSessionExerciseId)],
);

export const profile = sqliteTable("profile", {
  id: text("id").primaryKey().notNull(),
  displayName: text("display_name").notNull(),
  dateOfBirth: text("date_of_birth"),
  ...timestampColumns,
});

export const measurements = sqliteTable(
  "measurements",
  {
    id: text("id").primaryKey().notNull(),
    measurementType: text("measurement_type").notNull(),
    value: real("value").notNull(),
    unit: text("unit").notNull(),
    measuredAt: text("measured_at").notNull(),
    notes: text("notes"),
    ...timestampColumns,
  },
  (table) => [
    index("measurements_measured_at_idx").on(table.measuredAt),
    index("measurements_measurement_type_idx").on(table.measurementType),
  ],
);

export const appSettings = sqliteTable("app_settings", {
  id: text("id").primaryKey().notNull(),
  weightUnit: text("weight_unit").notNull().default("lb"),
  distanceUnit: text("distance_unit").notNull().default("mi"),
  heightUnit: text("height_unit").notNull().default("in"),
  themeMode: text("theme_mode").notNull().default("system"),
  ...timestampColumns,
});

export type Exercise = typeof exercises.$inferSelect;
export type WorkoutTemplate = typeof workoutTemplates.$inferSelect;
export type WorkoutTemplateExercise = typeof workoutTemplateExercises.$inferSelect;
export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type WorkoutSessionExercise = typeof workoutSessionExercises.$inferSelect;
export type WorkoutSet = typeof workoutSets.$inferSelect;
export type Profile = typeof profile.$inferSelect;
export type Measurement = typeof measurements.$inferSelect;
export type AppSettings = typeof appSettings.$inferSelect;
