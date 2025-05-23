PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_weight_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`weight` real NOT NULL,
	`unit` integer DEFAULT 0 NOT NULL,
	`date_created` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_weight_history`("id", "weight", "unit", "date_created") SELECT "id", "weight", "unit", "date_created" FROM `weight_history`;--> statement-breakpoint
DROP TABLE `weight_history`;--> statement-breakpoint
ALTER TABLE `__new_weight_history` RENAME TO `weight_history`;--> statement-breakpoint
PRAGMA foreign_keys=ON;