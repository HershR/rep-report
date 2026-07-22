export type PlateGroup = { size: number; count: number };

export type PlateLoadout = {
  /** Plates for one side of the bar, heaviest → lightest. */
  perSide: PlateGroup[];
  /** Weight actually loadable (bar + 2 × Σ plates), in display units. */
  loadedTotal: number;
  /** target − loadedTotal; > 0 means the plate set couldn't fully reach the target. */
  remainder: number;
  /** True when the target is below the bar's own weight. */
  belowBar: boolean;
};

/**
 * Greedily fits standard plates onto one side of a bar to reach a target weight.
 *
 * All arithmetic is done in integer hundredths (×100) to avoid float drift on
 * standard plate sizes (e.g. 82.5 − 20 = 62.5 → 31.25/side → 25 + 5 + 1.25 lands
 * exactly). Inputs/outputs are in the user's display unit (kg or lb).
 */
export function computePlateLoadout(
  target: number,
  bar: number,
  plateSizes: number[],
): PlateLoadout {
  if (!Number.isFinite(target) || target <= 0) {
    return { perSide: [], loadedTotal: bar, remainder: 0, belowBar: false };
  }

  if (target < bar) {
    return { perSide: [], loadedTotal: bar, remainder: 0, belowBar: true };
  }

  const toCents = (value: number) => Math.round(value * 100);

  // Weight to distribute across both sides, then per side, in cents.
  let perSideRemainingCents = Math.round(toCents(target - bar) / 2);
  const perSide: PlateGroup[] = [];

  for (const size of plateSizes) {
    const sizeCents = toCents(size);
    if (sizeCents <= 0) continue;
    const count = Math.floor(perSideRemainingCents / sizeCents);
    if (count > 0) {
      perSide.push({ size, count });
      perSideRemainingCents -= count * sizeCents;
    }
  }

  const loadedPerSideCents =
    Math.round(toCents(target - bar) / 2) - perSideRemainingCents;
  const loadedTotal = bar + (loadedPerSideCents * 2) / 100;
  const remainder = Number((target - loadedTotal).toFixed(2));

  return { perSide, loadedTotal, remainder, belowBar: false };
}
