import * as schema from "@/src//db/schema";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { DateTime } from "luxon";
import { createWorkoutWithExercise, addSetsToWorkout } from "./dbHelpers";
const exerciseIds = [
  73, 75, 91, 92, 1109, 272, 1339, 364, 366, 369, 373, 1342, 1343, 1341, 1243,
  822, 348, 567, 1350,
];
export async function seedDatabase(db: ExpoSQLiteDatabase<typeof schema>) {
  const date = DateTime.now();
  const notes = [
    "",
    "",
    "",
    "",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed porttitor eros sit amet tortor semper.",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean aliquet accumsan dictum. Curabitur quis ligula id velit ultricies congue. Cras sit amet scelerisque mi. Ut suscipit aliquet nisl, vitae auctor.",
  ];
  for (let index = 0; index < exerciseIds.length; index++) {
    const element = exerciseIds[index];
    const notesIndex = Math.floor(Math.random() * notes.length);
    const workout: Workout = {
      id: -1,
      exercise_id: element,
      date: date.minus({ day: index % 5 }).toISODate(),
      mode: 0,
      notes: notes[notesIndex],
      routine_id: null,
      sets: [],
    };
    const sets = [
      {
        workout_id: -1,
        order: 0,
        reps: Math.floor(Math.random() * 5) + 1,
        weight: Math.round(Math.random() * 100),
        duration: null,
      },
    ];
    const workoutId = await createWorkoutWithExercise(db, workout);
    await addSetsToWorkout(db, workoutId, sets);
  }
}
