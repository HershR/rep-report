import type {
  ExerciseSearchPage,
  ExerciseSearchResult,
} from "@/features/exercises/types";
import type {
  WgerApiListResponse,
  WgerExerciseInfo,
  WgerNamedEntity,
  WgerTranslation,
} from "@/services/wger/types";

function stripHtml(input?: string | null): string | null {
  if (!input) return null;
  const text = input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0 ? text : null;
}

function entityName(item: WgerNamedEntity | number): string | null {
  if (typeof item === "number") return null;
  return item.name ?? null;
}

function pickTranslation(
  translations?: WgerTranslation[],
): WgerTranslation | null {
  if (!translations || translations.length === 0) return null;
  const english = translations.find((entry) => entry.language === 2);
  return english ?? translations[0];
}

function categoryName(
  category?: WgerNamedEntity | number | null,
): string | null {
  if (!category || typeof category === "number") return null;
  return category.name ?? null;
}

function imageUrl(
  images?: { image: string; is_main?: boolean }[],
): string | null {
  if (!images || images.length === 0) return null;
  const main = images.find((item) => item.is_main);
  return (main ?? images[0])?.image ?? null;
}

export function mapWgerExerciseToSearchResult(
  input: WgerExerciseInfo,
): ExerciseSearchResult {
  const translation = pickTranslation(input.translations);
  const name =
    input.name?.trim() || translation?.name?.trim() || `Exercise ${input.id}`;
  const description = stripHtml(translation?.description ?? input.description);

  return {
    id: String(input.id),
    wgerExerciseId: input.id,
    name,
    description,
    category: categoryName(input.category),
    equipment: (input.equipment ?? [])
      .map(entityName)
      .filter((item): item is string => Boolean(item)),
    primaryMuscles: (input.muscles ?? [])
      .map(entityName)
      .filter((item): item is string => Boolean(item)),
    secondaryMuscles: (input.muscles_secondary ?? [])
      .map(entityName)
      .filter((item): item is string => Boolean(item)),
    imageUrl: imageUrl(input.images),
    source: "wger",
    isFavorite: false,
  };
}

function getPageFromUrl(url: string | null): number | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const offsetParam = parsed.searchParams.get("offset");
    const limitParam = parsed.searchParams.get("limit");

    const offset = offsetParam ? Number(offsetParam) : 0;
    const limit = limitParam ? Number(limitParam) : 20;
    if (!Number.isFinite(offset) || !Number.isFinite(limit) || limit <= 0)
      return null;
    return Math.floor(offset / limit) + 1;
  } catch {
    return null;
  }
}

export function mapWgerSearchResponse(
  input: WgerApiListResponse<WgerExerciseInfo>,
): ExerciseSearchPage {
  return {
    items: input.results.map(mapWgerExerciseToSearchResult),
    total: input.count ?? 0,
    nextPage: getPageFromUrl(input.next),
    previousPage: getPageFromUrl(input.previous),
  };
}
