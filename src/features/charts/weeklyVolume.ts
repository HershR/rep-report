import { startOfWeek, subWeeks } from "date-fns";

import type { WorkoutVolumePoint } from "@/features/workouts/repositories/workoutRepository";

export type WeekBucket = {
  /** Epoch ms of the week's local Monday midnight. */
  weekStart: number;
  volumeKg: number;
};

export type WeeklyVolume = {
  /** Oldest first, ending with the current week; empty weeks are zero. */
  weeks: WeekBucket[];
  /** Total of the same number of weeks immediately before `weeks`. */
  previousTotalKg: number;
};

const mondayOf = (date: Date) => startOfWeek(date, { weekStartsOn: 1 });

/** The earliest instant `bucketByWeek(…, now, weekCount)` reads from. */
export function weeklyVolumeSince(now: Date, weekCount: number): Date {
  return subWeeks(mondayOf(now), weekCount * 2 - 1);
}

/**
 * Buckets per-day volume into Monday-start weeks. Week boundaries come from
 * date-fns calendar arithmetic on local dates, never fixed 7-day millisecond
 * steps, so a daylight-saving change can't shift a session into the wrong week.
 */
export function bucketByWeek(
  points: WorkoutVolumePoint[],
  now: Date,
  weekCount: number,
): WeeklyVolume {
  const currentMonday = mondayOf(now);
  const weeks: WeekBucket[] = [];
  for (let back = weekCount - 1; back >= 0; back -= 1) {
    weeks.push({ weekStart: subWeeks(currentMonday, back).getTime(), volumeKg: 0 });
  }
  const indexByStart = new Map(weeks.map((week, index) => [week.weekStart, index] as const));
  const firstRecent = weeks[0].weekStart;
  const firstPrevious = weeklyVolumeSince(now, weekCount).getTime();

  let previousTotalKg = 0;
  for (const point of points) {
    const weekStart = mondayOf(new Date(point.t)).getTime();
    const index = indexByStart.get(weekStart);
    if (index !== undefined) {
      weeks[index].volumeKg += point.totalVolumeKg;
    } else if (weekStart >= firstPrevious && weekStart < firstRecent) {
      previousTotalKg += point.totalVolumeKg;
    }
  }

  return { weeks, previousTotalKg };
}
