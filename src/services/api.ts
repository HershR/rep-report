export const WGER_CONFIG = {
  BASE_URL: "https://wger.de/api/v2",
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
  const endpoint = `${WGER_CONFIG.BASE_URL}/exerciseinfo?${
    category ? `category=${category}&` : ""
  }${equipment ? `equipment=${equipment}` : ""}&offset=${offset || 0}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: WGER_CONFIG.header,
  });
  if (!response.ok) {
    throw new Error("Failed to fetch movies", response.statusText);
  }

  const data = await response.json();
  return data.results;
};

export const fetchExcerciseDetail = async ({ id }: { id: string }) => {
  const endpoint = `${WGER_CONFIG.BASE_URL}/exerciseinfo/${id}?offset=0`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: WGER_CONFIG.header,
  });
  if (!response.ok) {
    throw new Error("Failed to fetch movies", response.statusText);
  }

  const data = await response.json();
  return data.results;
};
