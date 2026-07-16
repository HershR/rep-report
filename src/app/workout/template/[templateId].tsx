import { useState } from "react";
import { View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";

import { CustomScreen } from "@/components/common";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
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
import { textToMetricWeight } from "@/lib/units";

export default function TemplateDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ templateId: string }>();
  const templateId = params.templateId;
  const queryClient = useQueryClient();
  const { favorites } = useFavoriteExercises();
  const { template, isLoading, error, refetch } = useWorkoutTemplate(templateId);
  const { appSettings } = useAppSettings();
  const weightUnit = appSettings?.weightUnit ?? "lb";
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const onSave = async (value: TemplateEditorValue) => {
    if (!templateId || !template) return;
    setIsSaving(true);
    try {
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
                targetWeight: textToMetricWeight(set.weightText, weightUnit),
                targetDurationSeconds: parseTemplateNumberText(set.durationText),
                targetDistance: parseTemplateNumberText(set.distanceText),
              });
            } else {
              await addSetToTemplateExercise({
                templateExerciseId: exercise.id,
                orderIndex: setIndex,
                targetReps: parseTemplateNumberText(set.repsText),
                targetWeight: textToMetricWeight(set.weightText, weightUnit),
                targetDurationSeconds: parseTemplateNumberText(set.durationText),
                targetDistance: parseTemplateNumberText(set.distanceText),
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
              targetWeight: textToMetricWeight(set.weightText, weightUnit),
              targetDurationSeconds: parseTemplateNumberText(set.durationText),
              targetDistance: parseTemplateNumberText(set.distanceText),
            });
          }
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["workout-templates"] }),
        queryClient.invalidateQueries({ queryKey: ["workout-template", templateId] }),
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  const onDeleteTemplate = async () => {
    if (!templateId) return;
    await deleteWorkoutTemplate(templateId);
    await queryClient.invalidateQueries({ queryKey: ["workout-templates"] });
    router.replace("/(tabs)/saved");
  };

  return (
    <CustomScreen scroll>
      <Text variant="h2">Edit Workout Template</Text>
      <Text variant="muted">Update name, exercises, and target sets.</Text>

      <Button
        variant="destructive"
        size="sm"
        className="mt-4 self-start"
        onPress={() => setDeleteConfirmOpen(true)}
      >
        <Text>Delete Template</Text>
      </Button>

      {isLoading ? (
        <Text variant="muted" className="mt-4">
          Loading template...
        </Text>
      ) : null}
      {error ? (
        <View className="mt-4 gap-2">
          <Text className="text-destructive text-sm">Could not load template.</Text>
          <Button variant="outline" size="sm" className="self-start" onPress={() => void refetch()}>
            <Text>Retry</Text>
          </Button>
        </View>
      ) : null}

      {!isLoading && template ? (
        <TemplateEditor initialTemplate={template} favorites={favorites} isSaving={isSaving} onSave={onSave} />
      ) : null}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete this template?"
        description="This can't be undone. The template and its target sets will be permanently removed."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          setDeleteConfirmOpen(false);
          void onDeleteTemplate();
        }}
      />
    </CustomScreen>
  );
}
