// schema.ts
import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// Exercises (from Wger API or user-defined)
export const exercises = sqliteTable("exercises", {
  id: integer("id").primaryKey(), //API key
  name: text("name").notNull(),
  category: text("category").notNull(),
  image: text("image"),
  is_favorite: integer("is_favorite", { mode: `boolean` }).default(false), // 0 = false, 1 = true
});

// Workout Routines (collections)
export const routines = sqliteTable("routines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  date_created: text("date_created").notNull(),
  last_updated: text("last_updated").notNull(),
});

// Routine Exercises (template for a routine)
export const routineExercises = sqliteTable("routine_exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  routine_id: integer("routine_id")
    .notNull()
    .references(() => routines.id, { onDelete: "cascade" }),
  exercise_id: integer("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "restrict" }),
  order: integer("order").default(0), // for sorting
});

// Workouts (log of exercises performed)
export const workouts = sqliteTable("workouts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date_created: text("date_created").notNull(),
  last_updated: text("last_updated").notNull(),
  date: text("date").notNull(), // ISO YYYY-MM-DD
  mode: integer("mode").notNull().default(0), // 0 = weight, 1 = time
  notes: text("notes"),
  routine_id: integer("routine_id").references(() => routines.id, {
    onDelete: "set null",
  }),
  exercise_id: integer("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "restrict" }),
});

// Sets for a Workout
export const workoutSets = sqliteTable("workout_sets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workout_id: integer("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  order: integer("order").notNull(), // Set index
  reps: integer("reps"),
  weight: real("weight"), // in lbs
  duration: text("duration"), // HH:mm:ss
});

export const routineSchedule = sqliteTable("routine_schedule", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  routine_id: integer("routine_id")
    .notNull()
    .references(() => routines.id, { onDelete: "cascade" }),
  day: integer("day").notNull(), //sunday=0 ... saterday = 6
});

export const weightHistory = sqliteTable("weight_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  weight: real("weight").notNull(), //in lbs
  date_created: text("date_created").notNull(),
});

export const userSettings = sqliteTable("user_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// Optional, for easier querying
export const workoutRoutineRelations = relations(routines, ({ many }) => ({
  workouts: many(workouts),
  routineExercises: many(routineExercises),
  routineSchedule: many(routineSchedule),
}));

export const workoutRelations = relations(workouts, ({ many, one }) => ({
  sets: many(workoutSets),
  exercise: one(exercises, {
    fields: [workouts.exercise_id],
    references: [exercises.id],
  }),
}));

export const routineExerciseRelations = relations(
  routineExercises,
  ({ one }) => ({
    exercise: one(exercises, {
      fields: [routineExercises.exercise_id],
      references: [exercises.id],
    }),
    routine: one(routines, {
      fields: [routineExercises.routine_id],
      references: [routines.id],
    }),
  })
);

export const workoutSetRelations = relations(workoutSets, ({ one }) => ({
  workout: one(workouts, {
    fields: [workoutSets.workout_id],
    references: [workouts.id],
  }),
}));

export const routineScheduleRelations = relations(
  routineSchedule,
  ({ one }) => ({
    routine: one(routines, {
      fields: [routineSchedule.routine_id],
      references: [routines.id],
    }),
  })
);
