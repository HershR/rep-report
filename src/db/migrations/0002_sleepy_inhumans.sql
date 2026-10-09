ALTER TABLE `app_settings` ADD `rest_timer_enabled` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `app_settings` ADD `rest_timer_default_seconds` integer DEFAULT 90 NOT NULL;