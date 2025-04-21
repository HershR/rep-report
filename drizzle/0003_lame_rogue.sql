ALTER TABLE `workouts` RENAME COLUMN "created_date" TO "date_created";--> statement-breakpoint
ALTER TABLE `workouts` RENAME COLUMN "updated_date" TO "last_updated";--> statement-breakpoint
ALTER TABLE `workouts` ADD `unit` text DEFAULT 'lb' NOT NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_exercises` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`image` text
);
--> statement-breakpoint
INSERT INTO `__new_exercises`("id", "name", "category", "image") SELECT "id", "name", "category", "image" FROM `exercises`;--> statement-breakpoint
DROP TABLE `exercises`;--> statement-breakpoint
ALTER TABLE `__new_exercises` RENAME TO `exercises`;--> statement-breakpoint
PRAGMA foreign_keys=ON;