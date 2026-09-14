import type { WorkoutTemplate } from "@/features/templates/types";

/**
 * The one-line "what is in this template" summary, shared by the Saved card and
 * the Home shortcut so the two cannot describe the same template differently.
 *
 * The mockup also carries an estimated duration ("~52 MIN"); that is left off
 * until there is something real to base it on rather than a guess presented in
 * the same voice as the counts.
 */
export function summarizeTemplate(template: WorkoutTemplate): string {
  const exerciseCount = template.exercises.length;
  const setCount = template.exercises.reduce(
    (total, exercise) => total + exercise.sets.length,
    0,
  );

  return `${exerciseCount} EX · ${setCount} SET${setCount === 1 ? "" : "S"}`;
}
