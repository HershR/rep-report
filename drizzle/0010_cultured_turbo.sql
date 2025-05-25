PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_weight_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`weight` real NOT NULL,
	`unit` text DEFAULT 'kg' NOT NULL,
	`date_created` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_weight_history`("id", "weight", "unit", "date_created") SELECT "id", "weight", "unit", "date_created" FROM `weight_history`;--> statement-breakpoint
DROP TABLE `weight_history`;--> statement-breakpoint
ALTER TABLE `__new_weight_history` RENAME TO `weight_history`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
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
ALTER TABLE `__new_workouts` RENAME TO `workouts`;