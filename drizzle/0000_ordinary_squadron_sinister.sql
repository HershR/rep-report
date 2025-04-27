CREATE TABLE `exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`wger_id` integer,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`image` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exercises_wger_id_unique` ON `exercises` (`wger_id`);--> statement-breakpoint
CREATE TABLE `routine_exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`routine_id` integer NOT NULL,
	`exercise_id` integer NOT NULL,
	`order` integer DEFAULT 0,
	FOREIGN KEY (`routine_id`) REFERENCES `workout_routines`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `workout_routines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`date_created` text NOT NULL,
	`last_updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workout_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workout_id` integer NOT NULL,
	`order` integer NOT NULL,
	`reps` integer,
	`weight` integer,
	`duration` text,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_date` text NOT NULL,
	`updated_date` text NOT NULL,
	`date` text NOT NULL,
	`mode` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`collection_id` integer,
	`exercise_id` integer NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `workout_routines`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE restrict
);
