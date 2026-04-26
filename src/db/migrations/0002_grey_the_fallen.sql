CREATE TABLE `workout_template_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`template_exercise_id` text NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`target_reps` integer,
	`target_weight` real,
	`target_duration_seconds` integer,
	`set_type` text DEFAULT 'normal' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`template_exercise_id`) REFERENCES `workout_template_exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `wts_template_exercise_id_idx` ON `workout_template_sets` (`template_exercise_id`);