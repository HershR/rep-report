import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable } from "react-native";

import { CustomScreen, CustomText } from "@/components/common";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { TemplateEditor } from "../../../features/templates/components/TemplateEditor";
import { useWorkoutTemplate } from "@/features/templates/hooks/useWorkoutTemplate";
import {
  parseTemplateNumberText,
  type TemplateEditorValue,
} from "@/features/templates/types";
import {
  addExerciseToTemplate,
  addSetToTemplateExercise,
  deleteTemplateSet,
  deleteWorkoutTemplate,
  removeExerciseFromTemplate,
  updateTemplateExercise,
  updateTemplateSet,
  updateWorkoutTemplate,
} from "@/features/templates/repositories/templateRepository";
import { textToMetricDistance } from "@/features/workouts/utils/distanceUnit";

export default function TemplateDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ templateId: string }>();
  const templateId = params.templateId;
  const queryClient = useQueryClient();
  const { favorites } = useFavoriteExercises();
  const { template, isLoading, error } = useWorkoutTemplate(templateId);
  const { appSettings } = useAppSettings();
  const distanceUnit = appSettings?.distanceUnit ?? "mi";

  const onSave = async (value: TemplateEditorValue) => {
    if (!templateId || !template) return;

    await updateWorkoutTemplate(templateId, {
      name: value.name,
      description: value.description,
    });

    const existingExercises = template.exercises;
    const existingExerciseById = new Map(existingExercises.map((item) => [item.id, item]));
    const nextExerciseIds = new Set(value.exercises.map((item) => item.id).filter(Boolean) as string[]);

    for (const exercise of existingExercises) {
      if (!nextExerciseIds.has(exercise.id)) {
        await removeExerciseFromTemplate(exercise.id);
      }
    }

    for (const [exerciseIndex, exercise] of value.exercises.entries()) {
      if (exercise.id) {
        await updateTemplateExercise(exercise.id, { orderIndex: exerciseIndex });
        const existingSets = existingExerciseById.get(exercise.id)?.sets ?? [];
        const nextSetIds = new Set(exercise.sets.map((set) => set.id).filter(Boolean) as string[]);

        for (const set of existingSets) {
          if (!nextSetIds.has(set.id)) {
            await deleteTemplateSet(set.id);
          }
        }

        for (const [setIndex, set] of exercise.sets.entries()) {
          if (set.id) {
            await updateTemplateSet(set.id, {
              orderIndex: setIndex,
              targetReps: parseTemplateNumberText(set.repsText),
              targetWeight: parseTemplateNumberText(set.weightText),
              targetDurationSeconds: parseTemplateNumberText(set.durationText),
              targetDistance: textToMetricDistance(set.distanceText, distanceUnit),
            });
          } else {
            await addSetToTemplateExercise({
              templateExerciseId: exercise.id,
              orderIndex: setIndex,
              targetReps: parseTemplateNumberText(set.repsText),
              targetWeight: parseTemplateNumberText(set.weightText),
              targetDurationSeconds: parseTemplateNumberText(set.durationText),
              targetDistance: textToMetricDistance(set.distanceText, distanceUnit),
            });
          }
        }
      } else {
        const addedExercise = await addExerciseToTemplate({
          templateId,
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
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["workout-templates"] }),
      queryClient.invalidateQueries({ queryKey: ["workout-template", templateId] }),
    ]);
  };

  const onDeleteTemplate = async () => {
    if (!templateId) return;
    await deleteWorkoutTemplate(templateId);
    await queryClient.invalidateQueries({ queryKey: ["workout-templates"] });
    router.replace("/(tabs)/saved");
  };

  return (
    <CustomScreen scroll>
      <CustomText variant="title">Edit Workout Template</CustomText>
      <CustomText muted>Update name, exercises, and target sets.</CustomText>
      <Pressable onPress={() => void onDeleteTemplate()}>
        <CustomText muted>Delete Template</CustomText>
      </Pressable>

      {isLoading ? <CustomText muted>Loading template...</CustomText> : null}
      {error ? <CustomText muted>Could not load template.</CustomText> : null}

      {!isLoading && template ? (
        <TemplateEditor initialTemplate={template} favorites={favorites} onSave={onSave} />
      ) : null}
    </CustomScreen>
  );
}
