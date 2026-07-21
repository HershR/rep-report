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
};

export type ExercisePersonalRecordsSummary = ExercisePersonalRecords & {
  exerciseName: string;
  exerciseCategory: string | null;
};
