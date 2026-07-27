import { useEffect, useState } from "react";

/** Zero-padded `HH:MM:SS` for a seconds count (e.g. 3723 → "01:02:03"). */
export function formatElapsed(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const remainingSeconds = clamped % 60;
  return [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

/**
 * Live elapsed-seconds counter derived from an ISO `startedAt`, ticking once a
 * second. Returns 0 when `startedAt` is absent. Shared by the active-workout
 * screen and the minimized workout bar so both show the same running clock.
 */
export function useElapsedSeconds(startedAt: string | null | undefined): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      return;
    }
    const tick = () => {
      setElapsed(
        Math.max(0, Math.floor((Date.now() - Date.parse(startedAt)) / 1000)),
      );
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  return elapsed;
}
