//API
export interface ExerciseInfo {
  id: number;
  uuid: string;
  category: Category;
  muscles: Muscles[];
  muscles_secondary: Muscles[];
  equipment: Equipment[];
  images: ExerciseImage[];
  translations: TranslationBaseInfo[];
}

export interface Muscles {
  id: number;
  name: string;
  is_front: boolean;
  image_url_main: string;
  image_url_secondary: string;
}

export interface Equipment {
  id: number;
  name: string;
}
export interface Category {
  id: number;
  name: string;
}

export interface ExerciseImage {
  id: number;
  image: string;
}

export interface TranslationBaseInfo {
  id: number;
  name: string;
  exercise: number;
  description: string;
  language: number;
}

export interface ExerciseSuggestion {
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
  id: number;
  wger_id: number; // Wger API ID
  name: string;
  category: string;
  image?: string; // URI
}
interface Workout {
  id: number;
  date: string; // ISO date
  mode: 0 | 1; // weight or time
  collection_id?: number; // foreign key
  exercise_id: number; // foreign key -> Exercise
  sets: WorkoutSet[];
}
export interface WorkoutSet {
  id: number;
  workout_id: number; //foreign key -> Workout
  order: number;
  reps?: number;
  weight?: number;
  duration?: string; // ISO HH:mm:ss
  notes?: string;
}

//Collection of exercises
interface WorkoutRoutine {
  id: number;
  name: string;
  date_created: string;
  last_updated: string;
  workout_count: number; // maybe computed later instead?
  description?: string; // optional
}

//Exercise belonging to a routine
interface RoutineExercise {
  id: number;
  routine_id: number; // foreign key -> Routine
  exercise_id: number; // foreign key -> Exercise
  order: number; // optional, for drag & drop later
}
