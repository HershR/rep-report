export const WGER_CONFIG = {
  BASE_URL: "https://wger.de",
  header: {
    accept: "application/json",
  },
};

export const fetchExcercises = async ({
  category = "",
  equipment = [],
  muscles = [],
  offset = 0,
  limit = 20,
}: {
  category: string;
  equipment: string[];
  muscles: string[];
  offset: number;
  limit: number;
}): Promise<{ results: ExerciseInfo[]; count: number }> => {
  const endpoint =
    `${WGER_CONFIG.BASE_URL}/api/v2/exerciseinfo/?` +
    `offset=${offset}&limit=${limit}` +
    (category ? `&category=${category}` : "") +
    equipment.map((x) => `&equipment=${x}`).join("") +
    muscles.map((x) => `&muscles=${x}`).join("");
  console.log(endpoint);
  const response = await fetch(endpoint, {
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
  exerciseId: string
): Promise<ExerciseInfo> => {
  try {
    const endpoint = `${WGER_CONFIG.BASE_URL}/api/v2/exerciseinfo/${exerciseId}?offset=0`;
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
    const endpoint = `${WGER_CONFIG.BASE_URL}/api/v2/exercise/search/?term=${query}&language=en`;
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
