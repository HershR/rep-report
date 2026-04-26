import type { ExerciseFilters } from "@/features/exercises/types";

export type WgerApiListResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type WgerNamedEntity = {
  id: number;
  name: string;
};

export type WgerTranslation = {
  id: number;
  language: number;
  name: string;
  description?: string | null;
};

export type WgerExerciseInfo = {
  id: number;
  name?: string;
  description?: string | null;
  category?: WgerNamedEntity | number | null;
  muscles?: (WgerNamedEntity | number)[];
  muscles_secondary?: (WgerNamedEntity | number)[];
  equipment?: (WgerNamedEntity | number)[];
  images?: { image: string; is_main?: boolean }[];
  translations?: WgerTranslation[];
};

export type WgerExerciseSearchRequest = ExerciseFilters;

export type WgerFilterOption = {
  id: number;
  name: string;
};
