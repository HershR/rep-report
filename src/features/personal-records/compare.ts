/**
 * The smallest weight difference that counts as heavier. Far below any real
 * plate increment (0.25 kg / 0.5 lb), and far above the float noise a trip
 * through another unit's rounded display can leave on a stored value - so a
 * 60 kg set re-entered via lb is still 60 kg as far as records are concerned.
 */
export const WEIGHT_EPSILON_KG = 0.01;

export function isHeavier(candidateKg: number, baselineKg: number): boolean {
  return candidateKg > baselineKg + WEIGHT_EPSILON_KG;
}
