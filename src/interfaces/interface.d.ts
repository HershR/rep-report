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
interface Workout {
  id: number; //primary key
  date: string; //ISO format YYYY-MM-DD
  exercise_id: number; //api id
  exercise_name: string;
  exercise_category: string;
  exercise_image: string; //image uri
  exercise_mode: 0 | 1; //weights or time
  exercise_sets: SetInfo[];
  collection_id: number; // foreign key
}
export interface SetInfo {
  workout_id: number; // foreign key
  id: number; //primary key
  index: number; //order
  reps?: number; //if mode is weight
  weight?: number; //if mode is weight
  durration?: string; //if mode is time ISO time format HH:mm:ss
}

interface WorkoutRoutine {
  id: number; //primary key
  date_created: string;
  last_updated: string;
  workout_count: number;
  name: string;
}

interface RoutineItem {
  routine_id: number; // foeign key
  id: number; //primary key
  exercise_id: number; //api id
  exercise_name: string;
  exercise_category: string;
  exercise_image: string; //image uri
}
