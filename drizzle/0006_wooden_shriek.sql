ALTER TABLE `workout_routines` RENAME TO `routines`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_workouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date_created` text NOT NULL,
	`last_updated` text NOT NULL,
	`date` text NOT NULL,
	`mode` integer DEFAULT 0 NOT NULL,
	`unit` text DEFAULT 'lb' NOT NULL,
	`notes` text,
	`routine_id` integer,
	`exercise_id` integer NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_workouts`("id", "date_created", "last_updated", "date", "mode", "unit", "notes", "routine_id", "exercise_id") SELECT "id", "date_created", "last_updated", "date", "mode", "unit", "notes", "routine_id", "exercise_id" FROM `workouts`;--> statement-breakpoint
DROP TABLE `workouts`;--> statement-breakpoint
ALTER TABLE `__new_workouts` RENAME TO `workouts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_routine_exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`routine_id` integer NOT NULL,
	`exercise_id` integer NOT NULL,
	`order` integer DEFAULT 0,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_routine_exercises`("id", "routine_id", "exercise_id", "order") SELECT "id", "routine_id", "exercise_id", "order" FROM `routine_exercises`;--> statement-breakpoint
DROP TABLE `routine_exercises`;--> statement-breakpoint
ALTER TABLE `__new_routine_exercises` RENAME TO `routine_exercises`;--> statement-breakpoint
CREATE TABLE `__new_routine_schedule` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`routine_id` integer NOT NULL,
	`day` integer NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_routine_schedule`("id", "routine_id", "day") SELECT "id", "routine_id", "day" FROM `routine_schedule`;--> statement-breakpoint
DROP TABLE `routine_schedule`;--> statement-breakpoint
ALTER TABLE `__new_routine_schedule` RENAME TO `routine_schedule`;