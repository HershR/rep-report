import { useQueryClient } from "@tanstack/react-query";
import { useRouter, type Href } from "expo-router";

import { CustomScreen, CustomText } from "@/components/common";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
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
import { textToMetricDistance } from "@/features/workouts/utils/distanceUnit";

export default function NewTemplateScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { favorites } = useFavoriteExercises();
  const { appSettings } = useAppSettings();
  const distanceUnit = appSettings?.distanceUnit ?? "mi";

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
          targetReps: parseTemplateNumberText(set.repsText),
          targetWeight: parseTemplateNumberText(set.weightText),
          targetDurationSeconds: parseTemplateNumberText(set.durationText),
          targetDistance: textToMetricDistance(set.distanceText, distanceUnit),
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
