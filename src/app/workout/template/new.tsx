import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, type Href } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { toast } from "sonner-native";

import { CustomScreen } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
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
      {/* Single-row header: no centre content to justify a second row. */}
      <View className="flex-row items-center gap-2 pb-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
        >
          <Icon as={ChevronLeft} className="text-foreground" />
        </Button>
        <Text variant="h3" numberOfLines={1} className="flex-1">
          New Template
        </Text>
        <Button
          size="sm"
          loading={isSaving}
          onPress={() => editorRef.current?.submit()}
        >
          <Text>Save</Text>
        </Button>
      </View>

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
