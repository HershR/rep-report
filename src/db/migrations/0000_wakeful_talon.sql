CREATE TABLE `app_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`weight_unit` text DEFAULT 'lb' NOT NULL,
	`distance_unit` text DEFAULT 'mi' NOT NULL,
	`height_unit` text DEFAULT 'in' NOT NULL,
	`theme_mode` text DEFAULT 'system' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`wger_exercise_id` integer,
	`name` text NOT NULL,
	`description` text,
	`category` text,
	`equipment` text,
	`primary_muscles` text,
	`secondary_muscles` text,
	`image_url` text,
	`is_favorite` integer DEFAULT 0 NOT NULL,
	`source` text DEFAULT 'wger' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exercises_wger_exercise_id_uidx` ON `exercises` (`wger_exercise_id`);--> statement-breakpoint
CREATE INDEX `exercises_name_idx` ON `exercises` (`name`);--> statement-breakpoint
CREATE TABLE `measurements` (
	`id` text PRIMARY KEY NOT NULL,
	`measurement_type` text NOT NULL,
	`value` real NOT NULL,
	`unit` text NOT NULL,
	`measured_at` text NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `measurements_measured_at_idx` ON `measurements` (`measured_at`);--> statement-breakpoint
CREATE INDEX `measurements_measurement_type_idx` ON `measurements` (`measurement_type`);--> statement-breakpoint
CREATE TABLE `profile` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`date_of_birth` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workout_session_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_session_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`workout_session_id`) REFERENCES `workout_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `wse_workout_session_id_idx` ON `workout_session_exercises` (`workout_session_id`);--> statement-breakpoint
CREATE TABLE `workout_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text,
	`name` text NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text,
	`duration_seconds` integer,
	`notes` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`template_id`) REFERENCES `workout_templates`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `workout_sessions_started_at_idx` ON `workout_sessions` (`started_at`);--> statement-breakpoint
CREATE INDEX `workout_sessions_completed_at_idx` ON `workout_sessions` (`completed_at`);--> statement-breakpoint
CREATE TABLE `workout_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_session_exercise_id` text NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`reps` integer,
	`weight` real,
	`duration_seconds` integer,
	`distance` real,
	`is_completed` integer DEFAULT 0 NOT NULL,
	`set_type` text DEFAULT 'normal' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`workout_session_exercise_id`) REFERENCES `workout_session_exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `workout_sets_wse_id_idx` ON `workout_sets` (`workout_session_exercise_id`);--> statement-breakpoint
CREATE TABLE `workout_template_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`template_id`) REFERENCES `workout_templates`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `wte_template_id_idx` ON `workout_template_exercises` (`template_id`);--> statement-breakpoint
CREATE TABLE `workout_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
