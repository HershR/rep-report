import { relations } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const EXERCISE_SOURCES = ["wger", "custom"] as const;
export type ExerciseSource = (typeof EXERCISE_SOURCES)[number];

export const SET_TYPES = ["normal", "warmup", "drop", "failure"] as const;
export type SetType = (typeof SET_TYPES)[number];

export const WORKOUT_SESSION_STATUSES = ["active", "completed"] as const;
export type WorkoutSessionStatus = (typeof WORKOUT_SESSION_STATUSES)[number];

export const WEIGHT_UNITS = ["lb", "kg"] as const;
export type WeightUnit = (typeof WEIGHT_UNITS)[number];

export const DISTANCE_UNITS = ["mi", "km"] as const;
export type DistanceUnit = (typeof DISTANCE_UNITS)[number];

export const HEIGHT_UNITS = ["in", "cm"] as const;
export type HeightUnit = (typeof HEIGHT_UNITS)[number];

export const THEME_MODES = ["system", "light", "dark"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

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
    source: text("source", { enum: EXERCISE_SOURCES }).notNull().default("wger"),
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

export const workoutTemplateSets = sqliteTable(
  "workout_template_sets",
  {
    id: text("id").primaryKey().notNull(),
    templateExerciseId: text("template_exercise_id")
      .notNull()
      .references(() => workoutTemplateExercises.id, { onDelete: "cascade" }),
    orderIndex: integer("order_index").notNull().default(0),
    targetReps: integer("target_reps"),
    targetWeight: real("target_weight"),
    targetDurationSeconds: integer("target_duration_seconds"),
    setType: text("set_type", { enum: SET_TYPES }).notNull().default("normal"),
    ...timestampColumns,
  },
  (table) => [index("wts_template_exercise_id_idx").on(table.templateExerciseId)],
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
    status: text("status", { enum: WORKOUT_SESSION_STATUSES }).notNull().default("active"),
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
    setType: text("set_type", { enum: SET_TYPES }).notNull().default("normal"),
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
  weightUnit: text("weight_unit", { enum: WEIGHT_UNITS }).notNull().default("lb"),
  distanceUnit: text("distance_unit", { enum: DISTANCE_UNITS }).notNull().default("mi"),
  heightUnit: text("height_unit", { enum: HEIGHT_UNITS }).notNull().default("in"),
  themeMode: text("theme_mode", { enum: THEME_MODES }).notNull().default("system"),
  ...timestampColumns,
});

export const workoutTemplatesRelations = relations(workoutTemplates, ({ many }) => ({
  templateExercises: many(workoutTemplateExercises),
  workoutSessions: many(workoutSessions),
}));

export const workoutTemplateExercisesRelations = relations(workoutTemplateExercises, ({ one, many }) => ({
  template: one(workoutTemplates, {
    fields: [workoutTemplateExercises.templateId],
    references: [workoutTemplates.id],
  }),
  exercise: one(exercises, {
    fields: [workoutTemplateExercises.exerciseId],
    references: [exercises.id],
  }),
  sets: many(workoutTemplateSets),
}));

export const workoutTemplateSetsRelations = relations(workoutTemplateSets, ({ one }) => ({
  templateExercise: one(workoutTemplateExercises, {
    fields: [workoutTemplateSets.templateExerciseId],
    references: [workoutTemplateExercises.id],
  }),
}));

export const workoutSessionsRelations = relations(workoutSessions, ({ one, many }) => ({
  template: one(workoutTemplates, {
    fields: [workoutSessions.templateId],
    references: [workoutTemplates.id],
  }),
  exercises: many(workoutSessionExercises),
}));

export const workoutSessionExercisesRelations = relations(workoutSessionExercises, ({ one, many }) => ({
  workoutSession: one(workoutSessions, {
    fields: [workoutSessionExercises.workoutSessionId],
    references: [workoutSessions.id],
  }),
  exercise: one(exercises, {
    fields: [workoutSessionExercises.exerciseId],
    references: [exercises.id],
  }),
  sets: many(workoutSets),
}));

export const workoutSetsRelations = relations(workoutSets, ({ one }) => ({
  workoutSessionExercise: one(workoutSessionExercises, {
    fields: [workoutSets.workoutSessionExerciseId],
    references: [workoutSessionExercises.id],
  }),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
  templateExercises: many(workoutTemplateExercises),
  workoutSessionExercises: many(workoutSessionExercises),
}));

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = typeof exercises.$inferInsert;
export type WorkoutTemplate = typeof workoutTemplates.$inferSelect;
export type InsertWorkoutTemplate = typeof workoutTemplates.$inferInsert;
export type WorkoutTemplateExercise = typeof workoutTemplateExercises.$inferSelect;
export type InsertWorkoutTemplateExercise = typeof workoutTemplateExercises.$inferInsert;
export type WorkoutTemplateSet = typeof workoutTemplateSets.$inferSelect;
export type InsertWorkoutTemplateSet = typeof workoutTemplateSets.$inferInsert;
export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type InsertWorkoutSession = typeof workoutSessions.$inferInsert;
export type WorkoutSessionExercise = typeof workoutSessionExercises.$inferSelect;
export type InsertWorkoutSessionExercise = typeof workoutSessionExercises.$inferInsert;
export type WorkoutSet = typeof workoutSets.$inferSelect;
export type InsertWorkoutSet = typeof workoutSets.$inferInsert;
export type Profile = typeof profile.$inferSelect;
export type InsertProfile = typeof profile.$inferInsert;
export type Measurement = typeof measurements.$inferSelect;
export type InsertMeasurement = typeof measurements.$inferInsert;
export type AppSettings = typeof appSettings.$inferSelect;
export type InsertAppSettings = typeof appSettings.$inferInsert;
