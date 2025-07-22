export const feetInchesToCm = (feet: number, inches: number) => {
  //round to first decimal
  return Math.round((feet * 12 + inches) * 2.54 * 10) / 10;
};
export const inchesToCm = (inches: number) => {
  return RoundToFirst(inches * 2.54);
};

export const cmToInches = (cm: number) => {
  return RoundToFirst(cm / 2.54);
};
export const cmToFeetInches = (cm: number) => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = RoundToFirst(totalInches % 12);

  return { feet, inches };
};
export const lbsToKg = (lbs: number) => {
  return RoundToFirst(lbs * 0.453592);
};
export const kgToLbs = (kg: number) => {
  return RoundToFirst(kg / 0.453592);
};

const RoundToFirst = (num: number) => {
  return Math.round(num * 10) / 10;
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

export function convertWeight(
  weight: number,
  currentUnit: Unit,
  targetUnit: Unit
) {
  if (currentUnit === targetUnit) {
    return weight;
  }
  if (targetUnit === "imperial") {
    return kgToLbs(weight);
  } else {
    return lbsToKg(weight);
  }
}
