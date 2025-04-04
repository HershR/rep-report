export interface ExerciseInfo {
  count: number;
  results: ExerciseInfo[];
}

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
