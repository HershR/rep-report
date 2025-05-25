PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_workouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date_created` text NOT NULL,
	`last_updated` text NOT NULL,
	`date` text NOT NULL,
	`mode` integer DEFAULT 0 NOT NULL,
	`unit` text DEFAULT 'kg' NOT NULL,
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
ALTER TABLE `weight_history` ADD `unit` text DEFAULT 'kg' NOT NULL;