import {
  ExerciseInfo,
  ExerciseInfoList,
  ExerciseSuggestion,
} from "@/types/WgerApiTypes";

export const WGER_CONFIG = {
  BASE_URL: "https://wger.de/api/v2",
  header: {
    accept: "application/json",
  },
};

export const fetchExcercises = async ({
  name = "",
  category = [],
  equipment = [],
  muscles = [],
  offset = 0,
  limit = 20,
}: {
  name?: string;
  category?: number[];
  equipment?: number[];
  muscles?: number[];
  offset: number;
  limit: number;
}): Promise<ExerciseInfoList> => {
  const endpoint = `${WGER_CONFIG.BASE_URL}/exerciseinfo/`;

  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
  });
  if (name) {
    params.set("name__search", name);
  }
  category.forEach((x) => params.append("category__in", x.toString()));
  equipment.forEach((x) => params.append("equipment__in", x.toString()));
  muscles.forEach((x) => params.append("muscles__in", x.toString()));

  const fullEndpoint = `${endpoint}?${params.toString()}`;
  console.log(fullEndpoint);
  const response = await fetch(fullEndpoint, {
    method: "GET",
    headers: WGER_CONFIG.header,
  });
  if (!response.ok) {
    // @ts-ignore
    throw new Error("Failed to fetch exercies", response.statusText);
  }

  const data = await response.json();
  return data;
};

export const fetchExerciseDetail = async (
  exerciseId: string,
): Promise<ExerciseInfo> => {
  try {
    const endpoint = `${WGER_CONFIG.BASE_URL}/exerciseinfo/${exerciseId}?offset=0`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: WGER_CONFIG.header,
    });
    if (!response.ok) {
      // @ts-ignore
      throw new Error("Failed to fetch exercie details", response.statusText);
    }
    const data: ExerciseInfo = await response.json();
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const searchExercise = async ({
  query,
}: {
  query: string;
}): Promise<ExerciseSuggestion[]> => {
  try {
    const endpoint = `${WGER_CONFIG.BASE_URL}/exercise/search/?term=${query}&language=en`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: WGER_CONFIG.header,
    });
    if (!response.ok) {
      // @ts-ignore
      throw new Error("Failed to fetch exercies search", response.statusText);
    }
    const data = await response.json();
    return data.suggestions;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
