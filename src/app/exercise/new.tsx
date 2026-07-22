import { useRouter, useLocalSearchParams } from "expo-router";

import { CustomScreen, ScreenHeader } from "@/components/common";
import { Text } from "@/components/ui/text";
import {
  CustomExerciseForm,
  type CustomExerciseFormValues,
} from "@/features/exercises/components/CustomExerciseForm";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";

export default function NewCustomExerciseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ initialName?: string }>();
  const { createCustomExercise, isCreating } = useFavoriteExercises();

  const onSave = async (value: CustomExerciseFormValues) => {
    const created = await createCustomExercise({
      name: value.name,
      description: value.description.trim() || null,
      category: value.category,
      equipment: value.equipment,
      primaryMuscles: value.primaryMuscles,
      secondaryMuscles: value.secondaryMuscles,
    });

    router.replace({
      pathname: "/exercise/[exerciseId]",
      params: { exerciseId: created.id, source: "local" },
    });
  };

  return (
    <CustomScreen scroll>
      <ScreenHeader title="New Custom Exercise" />
      <Text variant="muted">Add an exercise not found in the exercise library.</Text>
      <CustomExerciseForm
        initialName={params.initialName}
        isSaving={isCreating}
        onSave={(value) => void onSave(value)}
      />
    </CustomScreen>
  );
}
