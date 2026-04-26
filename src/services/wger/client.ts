import type { ExerciseSearchPage } from "@/features/exercises/types";
import {
  mapWgerExerciseToSearchResult,
  mapWgerSearchResponse,
} from "@/services/wger/mappers";
import type {
  WgerApiListResponse,
  WgerExerciseInfo,
  WgerExerciseSearchRequest,
} from "@/services/wger/types";

const WGER_BASE_URL = "https://wger.de/api/v2";
const DEFAULT_LIMIT = 20;

function toOffset(page: number, limit: number): number {
  return Math.max(0, (page - 1) * limit);
}

function appendList(params: URLSearchParams, key: string, values?: number[]) {
  values?.forEach((value) => {
    params.append(key, String(value));
  });
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`WGER request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

export async function searchWgerExercises(
  request: WgerExerciseSearchRequest,
): Promise<ExerciseSearchPage> {
  const page = request.page && request.page > 0 ? request.page : 1;
  const limit =
    request.limit && request.limit > 0 ? request.limit : DEFAULT_LIMIT;

  const params = new URLSearchParams({
    offset: String(toOffset(page, limit)),
    limit: String(limit),
  });

  if (request.query?.trim()) params.set("name__search", request.query.trim());
  appendList(params, "category__in", request.categoryIds);
  appendList(params, "equipment__in", request.equipmentIds);
  appendList(params, "muscles__in", request.muscleIds);

  const url = `${WGER_BASE_URL}/exerciseinfo/?${params.toString()}`;
  const response = await fetchJson<WgerApiListResponse<WgerExerciseInfo>>(url);
  return mapWgerSearchResponse(response);
}

export async function getWgerExerciseById(exerciseId: number) {
  const url = `${WGER_BASE_URL}/exerciseinfo/${exerciseId}/`;
  const response = await fetchJson<WgerExerciseInfo>(url);
  return mapWgerExerciseToSearchResult(response);
}
