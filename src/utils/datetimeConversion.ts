import { DateTime } from "luxon";

/**
 * Converts a UTC datetime string or Date to the system's local timezone.
 * @param utcDateTime ISO string or Date in UTC
 * @returns Date object in system timezone
 */
export function utcToSystemTimezone(utcDateTime: string | Date): Date {
  const utc =
    typeof utcDateTime === "string"
      ? DateTime.fromISO(utcDateTime, { zone: "utc" })
      : DateTime.fromJSDate(utcDateTime, { zone: "utc" });
  const local = utc.setZone(DateTime.local().zoneName);
  return local.toJSDate();
}

/**
 * Converts a local system timezone Date or ISO string to UTC Date.
 * @param localDateTime ISO string or Date in system timezone
 * @returns Date object in UTC
 */
export function systemTimezoneToUtc(localDateTime: string | Date): Date {
  const local =
    typeof localDateTime === "string"
      ? DateTime.fromISO(localDateTime)
      : DateTime.fromJSDate(localDateTime);
  const utc = local.setZone("utc");
  return utc.toJSDate();
}

/**
 * Formats a Date object as an ISO string in the system timezone.
 * @param date Date object
 * @returns ISO string in system timezone
 */
export function formatSystemTimezone(date: Date): string {
  return DateTime.fromJSDate(date).setZone(DateTime.local().zoneName).toISO()!;
}

/**
 * Converts a UTC datetime string or Date to midnight in the system's local timezone.
 * @param utcDateTime ISO string or Date in UTC
 * @returns Date object at midnight in local timezone
 */
export function utcToLocalMidnight(utcDateTime: string | Date): Date {
  const utc =
    typeof utcDateTime === "string"
      ? DateTime.fromISO(utcDateTime, { zone: "utc" })
      : DateTime.fromJSDate(utcDateTime, { zone: "utc" });
  const localMidnight = utc.setZone(DateTime.local().zoneName).startOf("day");
  return localMidnight.toJSDate();
}
