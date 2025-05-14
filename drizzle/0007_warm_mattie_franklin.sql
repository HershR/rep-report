CREATE TABLE `weight_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`weight` real NOT NULL,
	`date_created` text NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_workout_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workout_id` integer NOT NULL,
	`order` integer NOT NULL,
	`reps` integer,
	`weight` real,
	`duration` text,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_workout_sets`("id", "workout_id", "order", "reps", "weight", "duration") SELECT "id", "workout_id", "order", "reps", "weight", "duration" FROM `workout_sets`;--> statement-breakpoint
DROP TABLE `workout_sets`;--> statement-breakpoint
ALTER TABLE `__new_workout_sets` RENAME TO `workout_sets`;--> statement-breakpoint
PRAGMA foreign_keys=ON;