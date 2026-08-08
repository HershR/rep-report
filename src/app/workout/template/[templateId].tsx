import { useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MoreHorizontal } from "lucide-react-native";
import { toast } from "sonner-native";

import { CustomScreen, ScreenHeader } from "@/components/common";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import {
  TemplateEditor,
  type TemplateEditorHandle,
} from "@/features/templates/components/TemplateEditor";
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
import { ExerciseListSkeleton } from "@/features/workouts/components/ExerciseListSkeleton";

export default function TemplateDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ templateId: string }>();
  const templateId = params.templateId;
  const queryClient = useQueryClient();
  const { favorites } = useFavoriteExercises();
  const { template, isLoading, error, refetch } = useWorkoutTemplate(templateId);
  const [isSaving, setIsSaving] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const editorRef = useRef<TemplateEditorHandle>(null);

  const onSave = async (value: TemplateEditorValue) => {
    if (!templateId || !template) return;
    setIsSaving(true);
    try {
      await updateWorkoutTemplate(templateId, {
        name: value.name,
        description: value.description,
      });

      const existingExercises = template.exercises;
      const existingExerciseById = new Map(
        existingExercises.map((item) => [item.id, item]),
      );
      const nextExerciseIds = new Set(
        value.exercises.map((item) => item.id).filter(Boolean) as string[],
      );

      for (const exercise of existingExercises) {
        if (!nextExerciseIds.has(exercise.id)) {
          await removeExerciseFromTemplate(exercise.id);
        }
      }

      for (const [exerciseIndex, exercise] of value.exercises.entries()) {
        if (exercise.id) {
          await updateTemplateExercise(exercise.id, {
            orderIndex: exerciseIndex,
          });
          const existingSets = existingExerciseById.get(exercise.id)?.sets ?? [];
          const nextSetIds = new Set(
            exercise.sets.map((set) => set.id).filter(Boolean) as string[],
          );

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
                targetDurationSeconds: parseTemplateNumberText(
                  set.durationText,
                ),
                targetDistance: parseTemplateNumberText(set.distanceText),
              });
            } else {
              await addSetToTemplateExercise({
                templateExerciseId: exercise.id,
                orderIndex: setIndex,
                targetReps: parseTemplateNumberText(set.repsText),
                targetWeight: parseTemplateNumberText(set.weightText),
                targetDurationSeconds: parseTemplateNumberText(
                  set.durationText,
                ),
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
              targetWeight: parseTemplateNumberText(set.weightText),
              targetDurationSeconds: parseTemplateNumberText(set.durationText),
              targetDistance: parseTemplateNumberText(set.distanceText),
            });
          }
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["workout-templates"] }),
        queryClient.invalidateQueries({
          queryKey: ["workout-template", templateId],
        }),
      ]);
      toast.success("Template saved");
    } catch {
      toast.error("Could not save template. Your changes are still here.");
    } finally {
      setIsSaving(false);
    }
  };

  const onDeleteTemplate = async () => {
    if (!templateId) return;
    try {
      await deleteWorkoutTemplate(templateId);
      await queryClient.invalidateQueries({ queryKey: ["workout-templates"] });
      router.replace("/(tabs)/saved");
    } catch {
      toast.error("Could not delete template.");
    }
  };

  return (
    <CustomScreen>
      <ScreenHeader
        title={template?.name ?? "Template"}
        showBack
        className="pb-3"
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          accessibilityLabel="Template options"
          disabled={!template}
          onPress={() => setShowOptions(true)}
        >
          <Icon as={MoreHorizontal} className="text-foreground" />
        </Button>
        <Button
          size="sm"
          loading={isSaving}
          disabled={!template}
          onPress={() => editorRef.current?.submit()}
        >
          <Text>Save</Text>
        </Button>
      </ScreenHeader>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {error ? (
          <View className="gap-3 py-6">
            <Text className="text-destructive text-sm">
              Could not load template.
            </Text>
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              onPress={() => void refetch()}
            >
              <Text>Retry</Text>
            </Button>
          </View>
        ) : isLoading ? (
          <View className="py-4">
            <ExerciseListSkeleton />
          </View>
        ) : !template ? (
          <View className="gap-3 py-6">
            <Text variant="muted">This template no longer exists.</Text>
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              onPress={() => router.replace("/(tabs)/saved")}
            >
              <Text>Back to Saved</Text>
            </Button>
          </View>
        ) : (
          <TemplateEditor
            ref={editorRef}
            initialTemplate={template}
            favorites={favorites}
            onSave={onSave}
          />
        )}
      </ScrollView>

      {/* Options: destructive action kept out of the main flow. */}
      <Sheet open={showOptions} onOpenChange={setShowOptions}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Template options</SheetTitle>
          </SheetHeader>
          <View className="gap-4">
            <Button
              variant="destructive"
              onPress={() => {
                setShowOptions(false);
                setDeleteConfirmOpen(true);
              }}
            >
              <Text>Delete Template</Text>
            </Button>
          </View>
        </SheetContent>
      </Sheet>

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
