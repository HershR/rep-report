export type ExerciseFilters = {
  query?: string;
  categoryIds?: number[];
  equipmentIds?: number[];
  muscleIds?: number[];
  page?: number;
  limit?: number;
};

export type ExerciseSearchResult = {
  id: string;
  wgerExerciseId: number;
  name: string;
  description: string | null;
  category: string | null;
  equipment: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  imageUrl: string | null;
  source: "wger";
  isFavorite: boolean;
};

export type Exercise = {
  id: string;
  wgerExerciseId: number | null;
  name: string;
  description: string | null;
  category: string | null;
  equipment: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  imageUrl: string | null;
  source: "wger" | "custom";
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ExerciseSearchPage = {
  items: ExerciseSearchResult[];
  total: number;
  nextPage: number | null;
  previousPage: number | null;
};

export type ExerciseFilterOption = {
  id: number;
  name: string;
};
