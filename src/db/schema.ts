// schema.ts
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Exercises (from Wger API or user-defined)
export const exercises = sqliteTable("exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  wger_id: integer("wger_id").unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  image: text("image"),
  is_custom: integer("is_custom").default(0), // 0 = Wger, 1 = user
});

// Workout Routines (collections)
export const workoutRoutines = sqliteTable("workout_routines", {
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
    .references(() => workoutRoutines.id, { onDelete: "cascade" }),
  exercise_id: integer("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "restrict" }),
  order: integer("order").default(0), // for sorting
});

// Workouts (log of exercises performed)
export const workouts = sqliteTable("workouts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(), // ISO YYYY-MM-DD
  mode: integer("mode").notNull().default(0), // 0 = weight, 1 = time
  collection_id: integer("collection_id").references(() => workoutRoutines.id, {
    onDelete: "set null",
  }),
  exercise_id: integer("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "restrict" }),
  notes: text("notes"),
});

// Sets for a Workout
export const workoutSets = sqliteTable("workout_sets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workout_id: integer("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  order: integer("order").notNull(), // Set index
  reps: integer("reps"),
  weight: integer("weight"),
  duration: text("duration"), // HH:mm:ss
});

// Optional, for easier querying
export const workoutRoutineRelations = relations(
  workoutRoutines,
  ({ many }) => ({
    workouts: many(workouts),
    routineExercises: many(routineExercises),
  })
);

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
  })
);

export const workoutSetRelations = relations(workoutSets, ({ one }) => ({
  workout: one(workouts, {
    fields: [workoutSets.workout_id],
    references: [workouts.id],
  }),
}));
