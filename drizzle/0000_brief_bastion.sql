CREATE TABLE IF NOT EXISTS `exercises` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`image` text,
	`is_favorite` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `routine_exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`routine_id` integer NOT NULL,
	`exercise_id` integer NOT NULL,
	`order` integer DEFAULT 0,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `routine_schedule` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`routine_id` integer NOT NULL,
	`day` integer NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `routines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`date_created` text NOT NULL,
	`last_updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `user_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `weight_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`weight` real NOT NULL,
	`date_created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `workout_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workout_id` integer NOT NULL,
	`order` integer NOT NULL,
	`reps` integer,
	`weight` real,
	`duration` text,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `workouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date_created` text NOT NULL,
	`last_updated` text NOT NULL,
	`date` text NOT NULL,
	`mode` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`routine_id` integer,
	`exercise_id` integer NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE restrict
);
