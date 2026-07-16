export function formatDurationInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 6);
  if (digits.length === 0) return "";
  const padded = digits.padStart(6, "0");
  const hh = Number(padded.slice(0, 2));
  const mm = Number(padded.slice(2, 4));
  const ss = Number(padded.slice(4, 6));
  if (hh > 0) return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  if (mm > 0) return `${mm}:${String(ss).padStart(2, "0")}`;
  return String(ss);
}

export function secondsToDurationDisplay(seconds: number | null): string {
  if (seconds === null || seconds === 0) return "";
  const safe = Math.max(0, Math.floor(seconds));
  const hh = Math.floor(safe / 3600);
  const mm = Math.floor((safe % 3600) / 60);
  const ss = safe % 60;
  if (hh > 0) return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  if (mm > 0) return `${mm}:${String(ss).padStart(2, "0")}`;
  return String(ss);
}

export function durationDisplayToSeconds(value: string): number {
  const digits = value.replace(/\D/g, "").slice(0, 6).padStart(6, "0");
  const hh = Number(digits.slice(0, 2));
  const mm = Number(digits.slice(2, 4));
  const ss = Number(digits.slice(4, 6));
  return hh * 3600 + mm * 60 + ss;
}
