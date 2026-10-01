import { useRouter, type Href } from "expo-router";

import { CustomScreen, ScreenHeader } from "@/components/common";
import { Text } from "@/components/ui/text";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import { TemplateEditor } from "../../../features/templates/components/TemplateEditor";
import { useWorkoutTemplate } from "@/features/templates/hooks/useWorkoutTemplate";
import {
  templateDraftFromEditor,
  type TemplateEditorValue,
} from "@/features/templates/types";

export default function NewTemplateScreen() {
  const router = useRouter();
  const { favorites } = useFavoriteExercises();
  const { saveWorkoutTemplate, isSaving } = useWorkoutTemplate();

  const onSave = async (value: TemplateEditorValue) => {
    const createdId = await saveWorkoutTemplate(templateDraftFromEditor(value));
    router.replace(`/workout/template/${createdId}` as Href);
  };

  return (
    <CustomScreen scroll>
      <ScreenHeader title="New Template" />
      <Text variant="muted" className="mt-2">
        Build template using saved exercises.
      </Text>
      <TemplateEditor favorites={favorites} isSaving={isSaving} onSave={onSave} />
    </CustomScreen>
  );
}
