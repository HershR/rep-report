import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, type Href } from "expo-router";

import { CustomScreen } from "@/components/common";
import { Text } from "@/components/ui/text";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import { TemplateEditor } from "../../../features/templates/components/TemplateEditor";
import {
  parseTemplateNumberText,
  type TemplateEditorValue,
} from "@/features/templates/types";
import {
  addExerciseToTemplate,
  addSetToTemplateExercise,
  createWorkoutTemplate,
} from "@/features/templates/repositories/templateRepository";

export default function NewTemplateScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { favorites } = useFavoriteExercises();
  const [isSaving, setIsSaving] = useState(false);

  const onSave = async (value: TemplateEditorValue) => {
    setIsSaving(true);
    try {
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
            targetReps: parseTemplateNumberText(set.repsText),
            targetWeight: parseTemplateNumberText(set.weightText),
            targetDurationSeconds: parseTemplateNumberText(set.durationText),
            targetDistance: parseTemplateNumberText(set.distanceText),
          });
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["workout-templates"] }),
        queryClient.invalidateQueries({ queryKey: ["workout-template", created.id] }),
      ]);

      router.replace(`/workout/template/${created.id}` as Href);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CustomScreen scroll>
      <Text variant="h2">New Workout Template</Text>
      <Text variant="muted">Build template using saved exercises.</Text>
      <TemplateEditor favorites={favorites} isSaving={isSaving} onSave={onSave} />
    </CustomScreen>
  );
}
