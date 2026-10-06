import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import { CustomScreen, ErrorState, LoadingState, ScreenHeader } from "@/components/common";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import { TemplateEditor } from "../../../features/templates/components/TemplateEditor";
import { useWorkoutTemplate } from "@/features/templates/hooks/useWorkoutTemplate";
import { useWorkoutTemplates } from "@/features/templates/hooks/useWorkoutTemplates";
import {
  templateDraftFromEditor,
  type TemplateEditorValue,
} from "@/features/templates/types";

export default function TemplateDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ templateId: string }>();
  const templateId = params.templateId;
  const { favorites } = useFavoriteExercises();
  const { template, isLoading, error, refetch, saveWorkoutTemplate, isSaving } =
    useWorkoutTemplate(templateId);
  const { deleteWorkoutTemplate } = useWorkoutTemplates();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const onSave = async (value: TemplateEditorValue) => {
    if (!templateId || !template) return;
    await saveWorkoutTemplate(templateDraftFromEditor(value));
  };

  const onDeleteTemplate = async () => {
    if (!templateId) return;
    await deleteWorkoutTemplate(templateId);
    router.replace("/(tabs)/saved");
  };

  return (
    <CustomScreen scroll>
      <ScreenHeader title="Edit template" />
      <Text variant="body" className="text-text-3 mt-2">
        Update name, exercises, and target sets.
      </Text>

      {isLoading ? <LoadingState className="mt-4" /> : null}
      {error ? (
        <ErrorState
          className="mt-4"
          title="Couldn't load this template"
          onRetry={() => void refetch()}
        />
      ) : null}

      {!isLoading && template ? (
        <>
          <TemplateEditor
            initialTemplate={template}
            favorites={favorites}
            isSaving={isSaving}
            onSave={onSave}
          />
          <Button variant="ghost" onPress={() => setDeleteConfirmOpen(true)}>
            <Text className="text-destructive">Delete template</Text>
          </Button>
        </>
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
