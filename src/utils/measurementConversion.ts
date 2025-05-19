export type Unit = "imperial" | "metric";

export const inchesToCm = (inches: number) => {
  return parseFloat((inches * 2.54).toFixed(1));
};

export const cmToInches = (cm: number) => {
  return parseFloat((cm / 2.54).toFixed(1));
};
export const cmToFeetInches = (cm: number) => {
  const totalInches = cmToInches(cm);
  const feet = Math.floor(totalInches / 12);
  const inches = parseFloat((totalInches % 12).toFixed(1));
  return { feet, inches };
};
export const lbsToKg = (lbs: number) => {
  return parseFloat((lbs * 0.453592).toFixed(1));
};
export const kgToLbs = (kg: number) => {
  return parseFloat((kg / 0.453592).toFixed(1));
};
export function convertHeightString(
  height: number,
  currentUnit: Unit,
  targetUnit: Unit
) {
  if (currentUnit === targetUnit) {
    return height + (targetUnit === "imperial" ? " inches" : " cm");
  }
  if (targetUnit === "imperial") {
    const { feet, inches } = cmToFeetInches(height);
    return `${feet}' ${inches}"`;
  } else {
    const cm = Math.round(height / 0.393701);
    return cm + " cm";
  }
}
export function convertWeightString(
  weight: number,
  currentUnit: Unit,
  targetUnit: Unit
) {
  if (currentUnit === targetUnit) {
    return weight + (targetUnit === "imperial" ? " lbs" : " kg");
  }
  if (targetUnit === "imperial") {
    return kgToLbs(weight) + " lbs";
  } else {
    return lbsToKg(weight) + " kg";
  }
}
