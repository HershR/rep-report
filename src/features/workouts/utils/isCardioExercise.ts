export function isCardioExercise(category: string | null, name: string): boolean {
  const categoryValue = (category ?? "").toLowerCase();
  const nameValue = name.toLowerCase();
  return (
    categoryValue.includes("cardio") ||
    nameValue.includes("cardio") ||
    nameValue.includes("run") ||
    nameValue.includes("bike") ||
    nameValue.includes("cycle") ||
    nameValue.includes("row")
  );
}
