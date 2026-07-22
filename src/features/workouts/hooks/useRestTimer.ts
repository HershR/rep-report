import { useEffect, useRef, useState } from "react";

export type RestTimer = {
  isResting: boolean;
  remainingSeconds: number;
  /** Duration the current rest was started with — for the progress-bar ratio. */
  totalSeconds: number;
  /** Start (or restart) a rest to a full duration. */
  startRest: (seconds: number) => void;
  /** Add/subtract time to the running rest; remaining is clamped at 0. */
  addTime: (deltaSeconds: number) => void;
  /** End the rest immediately without firing the elapsed callback. */
  skipRest: () => void;
};

/**
 * Ephemeral rest countdown, screen-local (not persisted). Mirrors the active
 * workout's elapsed timer: the value is derived from a stored wall-clock epoch
 * (`restEndsAt`) with a 1s interval only to trigger re-render, so it stays
 * correct across JS-thread stalls / backgrounding. `onElapsed` fires exactly
 * once when the countdown reaches zero.
 */
export function useRestTimer(onElapsed: () => void): RestTimer {
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const onElapsedRef = useRef(onElapsed);
  useEffect(() => {
    onElapsedRef.current = onElapsed;
  }, [onElapsed]);

  useEffect(() => {
    if (restEndsAt === null) return;

    const tick = () => {
      const remaining = Math.ceil((restEndsAt - Date.now()) / 1000);
      if (remaining <= 0) {
        setRemainingSeconds(0);
        setRestEndsAt(null);
        onElapsedRef.current();
        return;
      }
      setRemainingSeconds(remaining);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [restEndsAt]);

  const startRest = (seconds: number) => {
    if (seconds <= 0) return;
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setRestEndsAt(Date.now() + seconds * 1000);
  };

  const addTime = (deltaSeconds: number) => {
    setRestEndsAt((current) => {
      if (current === null) return current;
      return Math.max(Date.now(), current + deltaSeconds * 1000);
    });
  };

  const skipRest = () => {
    setRemainingSeconds(0);
    setRestEndsAt(null);
  };

  return {
    isResting: restEndsAt !== null,
    remainingSeconds,
    totalSeconds,
    startRest,
    addTime,
    skipRest,
  };
}
