// dateUtils.ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

/** UTC ISO -> local calendar day "YYYY-MM-DD" */
export function utcISOToLocalDay(utcISO: string): string {
  return dayjs.utc(utcISO).local().format('YYYY-MM-DD');
}

/**
 * local calendar day "YYYY-MM-DD" -> UTC ISO
 * Interprets the chosen day as LOCAL midnight, then converts to UTC.
 */
export function localDayToUtcISO(localDay: string): string {
  // localDay is interpreted in local time by dayjs(localDay)
  return dayjs(localDay).startOf('day').utc().toISOString();
}

/** Now in UTC ISO */
export function nowUtcISO(): string {
  return dayjs.utc().toISOString();
}

export function formatDate(date: string, format: string): string {
  return dayjs(date).format(format);
}
