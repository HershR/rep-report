//API
interface ExerciseInfo {
  id: number;
  uuid: string;
  category: Category;
  muscles: Muscles[];
  muscles_secondary: Muscles[];
  equipment: Equipment[];
  images: ExerciseImage[];
  translations: TranslationBaseInfo[];
}

interface Muscles {
  id: number;
  name: string;
  is_front: boolean;
  image_url_main: string;
  image_url_secondary: string;
}

interface Equipment {
  id: number;
  name: string;
}
interface Category {
  id: number;
  name: string;
}

interface ExerciseImage {
  id: number;
  image: string;
}

interface TranslationBaseInfo {
  id: number;
  name: string;
  exercise: number;
  description: string;
  language: number;
}

interface ExerciseSuggestion {
  value: string;
  data: {
    id: number;
    base_id: number;
    name: string;
    category: string;
    image: string;
    image_thumbnail: string;
  };
}
//DB
interface Exercise {
  id: number; // Wger API ID
  name: string;
  category: string;
  image: string | null; // URI
  is_favorite: boolean | null; // 0 = false, 1 = true
}
interface Workout {
  id: number;
  date: string; // ISO date
  mode: number; // weight or time
  routine_id: number | null; // foreign key
  exercise_id: number; // foreign key -> Exercise
  notes: string | null;
  sets: WorkoutSet[];
}
interface WorkoutWithExercise extends Workout {
  exercise: Exercise;
}
interface WorkoutSet {
  id: number;
  workout_id: number; //foreign key -> Workout
  order: number;
  reps: number | null;
  weight: number | null;
  duration: string | null; // ISO HH:mm:ss
}

//Collection of exercises
interface WorkoutRoutine {
  id: number;
  name: string;
  date_created: string;
  last_updated: string;
  workout_count: number; // maybe computed later instead?
  description?: string; // optional
  exercises?: Exercise[];
}

//Exercise belonging to a routine
interface RoutineExercise {
  id: number;
  routine_id: number; // foreign key -> Routine
  exercise_id: number; // foreign key -> Exercise
  order: number; // optional, for drag & drop later
}

interface RoutineDay {
  id: number;
  routine_id: number;
  day: number;
}
