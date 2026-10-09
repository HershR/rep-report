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
/** Without this a stalled connection never settles and screens sit on their
 *  loading state forever; the error paths already handle a rejection. */
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * WGER couldn't be reached at all - no connection, or no answer in time. Not
 * worth retrying: the next attempt fails the same way, just later. Screens use
 * this to show an offline state instead of a generic error.
 */
export class WgerUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WgerUnavailableError";
  }
}

export class WgerTimeoutError extends WgerUnavailableError {
  constructor() {
    super("The exercise service did not respond. Check your connection.");
    this.name = "WgerTimeoutError";
  }
}

export class WgerOfflineError extends WgerUnavailableError {
  constructor() {
    super("You're offline. Exercise search needs a connection.");
    this.name = "WgerOfflineError";
  }
}

function toOffset(page: number, limit: number): number {
  return Math.max(0, (page - 1) * limit);
}

function appendList(params: URLSearchParams, key: string, values?: number[]) {
  values?.forEach((value) => {
    params.append(key, String(value));
  });
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`WGER request failed (${response.status})`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new WgerTimeoutError();
    }
    // React Native's fetch rejects with a TypeError ("Network request failed")
    // when there is no connection at all; HTTP errors are thrown above, inside
    // the try, as plain Errors.
    if (error instanceof TypeError) {
      throw new WgerOfflineError();
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
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
    language__code: "en",
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
