import { useQueryClient } from "@tanstack/react-query";
import { useRouter, type Href } from "expo-router";

import { CustomScreen, CustomText } from "@/components/common";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import { TemplateEditor, type TemplateEditorValue } from "@/features/templates/components/TemplateEditor";
import {
  addExerciseToTemplate,
  addSetToTemplateExercise,
  createWorkoutTemplate,
} from "@/features/templates/repositories/templateRepository";

function parseValue(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function NewTemplateScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { favorites } = useFavoriteExercises();

  const onSave = async (value: TemplateEditorValue) => {
    const created = await createWorkoutTemplate({
      name: value.name,
      description: value.description,
    });

    for (const [exerciseIndex, exercise] of value.exercises.entries()) {
      const addedExercise = await addExerciseToTemplate({
        templateId: created.id,
        exerciseId: exercise.exerciseId,
        orderIndex: exerciseIndex,
      });

      for (const [setIndex, set] of exercise.sets.entries()) {
        await addSetToTemplateExercise({
          templateExerciseId: addedExercise.id,
          orderIndex: setIndex,
          targetReps: parseValue(set.repsText),
          targetWeight: parseValue(set.weightText),
          targetDurationSeconds: parseValue(set.durationText),
        });
      }
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["workout-templates"] }),
      queryClient.invalidateQueries({ queryKey: ["workout-template", created.id] }),
    ]);

    router.replace(`/workout/template/${created.id}` as Href);
  };

  return (
    <CustomScreen scroll>
      <CustomText variant="title">New Workout Template</CustomText>
      <CustomText muted>Build template using saved exercises.</CustomText>
      <TemplateEditor favorites={favorites} onSave={onSave} />
    </CustomScreen>
  );
}
