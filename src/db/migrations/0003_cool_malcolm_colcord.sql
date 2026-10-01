-- Only one workout may be in progress. Older `active` rows were stranded by a
-- UI bug and can never be reached; drop them, children first, so the unique
-- index below can be created. Keeps the newest, which is the one the app shows.
DELETE FROM `workout_sets` WHERE `workout_session_exercise_id` IN (
  SELECT `id` FROM `workout_session_exercises` WHERE `workout_session_id` IN (
    SELECT `id` FROM `workout_sessions`
    WHERE `status` = 'active' AND `id` <> (
      SELECT `id` FROM `workout_sessions` WHERE `status` = 'active'
      ORDER BY `started_at` DESC, `id` DESC LIMIT 1
    )
  )
);--> statement-breakpoint
DELETE FROM `workout_session_exercises` WHERE `workout_session_id` IN (
  SELECT `id` FROM `workout_sessions`
  WHERE `status` = 'active' AND `id` <> (
    SELECT `id` FROM `workout_sessions` WHERE `status` = 'active'
    ORDER BY `started_at` DESC, `id` DESC LIMIT 1
  )
);--> statement-breakpoint
DELETE FROM `workout_sessions`
WHERE `status` = 'active' AND `id` <> (
  SELECT `id` FROM `workout_sessions` WHERE `status` = 'active'
  ORDER BY `started_at` DESC, `id` DESC LIMIT 1
);--> statement-breakpoint
CREATE UNIQUE INDEX `workout_sessions_one_active_uidx` ON `workout_sessions` (`status`) WHERE "workout_sessions"."status" = 'active';--> statement-breakpoint
-- Measurements are stored canonically (kg, cm) like every other quantity.
-- Convert any legacy display-unit rows; a no-op when there are none.
UPDATE `measurements` SET `value` = `value` * 0.45359237, `unit` = 'kg' WHERE `unit` = 'lb';--> statement-breakpoint
UPDATE `measurements` SET `value` = `value` * 2.54, `unit` = 'cm' WHERE `unit` = 'in';
