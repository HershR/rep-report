import { differenceInCalendarDays } from "date-fns";

/**
 * Computes the current and best (longest-ever) consecutive-day workout streaks
 * from a list of `yyyy-MM-dd` day keys (each representing a local calendar day
 * on which at least one workout was completed).
 *
 * The current streak anchors on today or yesterday: it counts back from the most
 * recent active day only if that day is today or yesterday, so a streak isn't
 * considered broken simply because today hasn't been logged yet. If the most
 * recent active day is 2+ days ago, the current streak is 0.
 */
export function computeStreaks(dateKeys: string[]): {
  current: number;
  best: number;
} {
  const uniqueSorted = [...new Set(dateKeys)]
    .map((key) => new Date(`${key}T00:00:00`))
    .sort((a, b) => a.getTime() - b.getTime());

  if (uniqueSorted.length === 0) return { current: 0, best: 0 };

  let best = 1;
  let run = 1;
  for (let i = 1; i < uniqueSorted.length; i += 1) {
    const gap = differenceInCalendarDays(uniqueSorted[i], uniqueSorted[i - 1]);
    run = gap === 1 ? run + 1 : 1;
    if (run > best) best = run;
  }

  const today = new Date();
  const mostRecent = uniqueSorted[uniqueSorted.length - 1];
  const daysSinceMostRecent = differenceInCalendarDays(today, mostRecent);

  let current = 0;
  if (daysSinceMostRecent === 0 || daysSinceMostRecent === 1) {
    current = 1;
    for (let i = uniqueSorted.length - 1; i > 0; i -= 1) {
      const gap = differenceInCalendarDays(uniqueSorted[i], uniqueSorted[i - 1]);
      if (gap === 1) {
        current += 1;
      } else {
        break;
      }
    }
  }

  return { current, best };
}
