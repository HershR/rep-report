export type PersonalRecordEntry = {
  weight: number | null;
  reps: number | null;
  volume: number | null;
  achievedAt: string;
  workoutSessionId: string;
};

export type ExercisePersonalRecords = {
  exerciseId: string;
  heaviestWeight: PersonalRecordEntry | null;
  bestSetVolume: PersonalRecordEntry | null;
  bestSessionVolume: PersonalRecordEntry | null;
  mostReps: PersonalRecordEntry | null;
  /** Best estimated 1RM (Epley); the estimate in kg is carried in `volume`. */
  bestEstimated1RM: PersonalRecordEntry | null;
};

export type ExercisePersonalRecordsSummary = ExercisePersonalRecords & {
  exerciseName: string;
  exerciseCategory: string | null;
};

export type SetPrResult = {
  exerciseName: string;
  isWeightPr: boolean;
  isRepsPr: boolean;
  weightKg: number | null;
  reps: number | null;
};
