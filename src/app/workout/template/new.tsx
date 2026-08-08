import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, type Href } from "expo-router";
import { ScrollView } from "react-native";
import { toast } from "sonner-native";

import { CustomScreen, ScreenHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import {
  TemplateEditor,
  type TemplateEditorHandle,
} from "@/features/templates/components/TemplateEditor";
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
  const editorRef = useRef<TemplateEditorHandle>(null);

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
        queryClient.invalidateQueries({
          queryKey: ["workout-template", created.id],
        }),
      ]);

      router.replace(`/workout/template/${created.id}` as Href);
    } catch {
      toast.error("Could not save template. Your changes are still here.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CustomScreen>
      <ScreenHeader title="New Template" showBack className="pb-3">
        <Button
          size="sm"
          loading={isSaving}
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
        <TemplateEditor
          ref={editorRef}
          favorites={favorites}
          onSave={onSave}
        />
      </ScrollView>
    </CustomScreen>
  );
}
