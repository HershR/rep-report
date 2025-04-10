export const WGER_CONFIG = {
  BASE_URL: "https://wger.de",
  header: {
    accept: "application/json",
  },
};

export const fetchExcercises = async ({
  offset,
  category,
  equipment,
}: {
  offset: string;
  category: string;
  equipment: string;
}) => {
  const endpoint = `${WGER_CONFIG.BASE_URL}/api/v2/exerciseinfo?${
    category ? `category=${category}&` : ""
  }${equipment ? `equipment=${equipment}` : ""}&offset=${offset || 0}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: WGER_CONFIG.header,
  });
  if (!response.ok) {
    throw new Error("Failed to fetch exercies", response.statusText);
  }

  const data = await response.json();
  return data.results;
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
      throw new Error("Failed to fetch exercie details", response.statusText);
    }
    const data = await response.json();
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
      throw new Error("Failed to fetch exercies search", response.statusText);
    }
    const data = await response.json();
    return data.suggestions;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
