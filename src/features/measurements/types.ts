import type { SupportedMeasurementType } from "@/features/measurements/repositories/measurementRepository";

export const BODY_MEASUREMENT_TYPES = [
  "chest",
  "waist",
  "hips",
  "shoulders",
  "left_arm",
  "right_arm",
  "left_thigh",
  "right_thigh",
] as const satisfies readonly SupportedMeasurementType[];

export type BodyMeasurementType = (typeof BODY_MEASUREMENT_TYPES)[number];

export const MEASUREMENT_LABELS: Record<SupportedMeasurementType, string> = {
  weight: "Weight",
  height: "Height",
  chest: "Chest",
  waist: "Waist",
  hips: "Hips",
  shoulders: "Shoulders",
  left_arm: "Left Arm",
  right_arm: "Right Arm",
  left_thigh: "Left Thigh",
  right_thigh: "Right Thigh",
};
