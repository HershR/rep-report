import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { ChoiceChip } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import {
  wgerCategories,
  wgerEquipment,
  wgerMuscles,
} from "@/services/wger/constants";

const CATEGORY_OPTIONS = Object.values(wgerCategories).sort((a, b) =>
  a.localeCompare(b),
);
const EQUIPMENT_OPTIONS = Object.values(wgerEquipment).sort((a, b) =>
  a.localeCompare(b),
);
const MUSCLE_OPTIONS = Array.from(
  new Set(wgerMuscles.map((muscle) => muscle.name_en || muscle.name).filter(Boolean)),
).sort((a, b) => a.localeCompare(b));

const customExerciseFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string(),
  category: z.string().min(1, "Pick a category"),
  equipment: z.array(z.string()),
  primaryMuscles: z.array(z.string()),
  secondaryMuscles: z.array(z.string()),
});

export type CustomExerciseFormValues = z.infer<typeof customExerciseFormSchema>;

type CustomExerciseFormProps = {
  initialName?: string;
  isSaving?: boolean;
  onSave: (value: CustomExerciseFormValues) => void;
};

function getErrorMessage(errors: FieldErrors<CustomExerciseFormValues>): string | null {
  return errors.name?.message ?? errors.category?.message ?? null;
}

export function CustomExerciseForm({
  initialName,
  isSaving = false,
  onSave,
}: CustomExerciseFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomExerciseFormValues>({
    resolver: zodResolver(customExerciseFormSchema),
    defaultValues: {
      name: initialName ?? "",
      description: "",
      category: "",
      equipment: [],
      primaryMuscles: [],
      secondaryMuscles: [],
    },
  });

  const onSubmit = handleSubmit((value) => onSave(value));
  const errorMessage = getErrorMessage(errors);

  return (
    <View className="mt-4 gap-4 pb-8">
      <View className="gap-2">
        <Label>Name</Label>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange } }) => (
            <Input value={value} onChangeText={onChange} placeholder="Exercise name" />
          )}
        />
      </View>

      <View className="gap-2">
        <Label>Description (optional)</Label>
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange } }) => (
            <Textarea
              value={value}
              onChangeText={onChange}
              placeholder="Description (optional)"
            />
          )}
        />
      </View>

      <View className="gap-2">
        <Label>Category</Label>
        <Controller
          control={control}
          name="category"
          render={({ field: { value, onChange } }) => (
            <View className="flex-row flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((option) => (
                <ChoiceChip
                  key={option}
                  label={option}
                  selected={value === option}
                  onPress={() => onChange(option)}
                />
              ))}
            </View>
          )}
        />
      </View>

      <View className="gap-2">
        <Label>Equipment (optional)</Label>
        <Controller
          control={control}
          name="equipment"
          render={({ field: { value, onChange } }) => (
            <View className="flex-row flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((option) => (
                <ChoiceChip
                  key={option}
                  label={option}
                  selected={value.includes(option)}
                  onPress={() =>
                    onChange(
                      value.includes(option)
                        ? value.filter((item) => item !== option)
                        : [...value, option],
                    )
                  }
                />
              ))}
            </View>
          )}
        />
      </View>

      <View className="gap-2">
        <Label>Primary muscles (optional)</Label>
        <Controller
          control={control}
          name="primaryMuscles"
          render={({ field: { value, onChange } }) => (
            <View className="flex-row flex-wrap gap-2">
              {MUSCLE_OPTIONS.map((option) => (
                <ChoiceChip
                  key={option}
                  label={option}
                  selected={value.includes(option)}
                  onPress={() =>
                    onChange(
                      value.includes(option)
                        ? value.filter((item) => item !== option)
                        : [...value, option],
                    )
                  }
                />
              ))}
            </View>
          )}
        />
      </View>

      <View className="gap-2">
        <Label>Secondary muscles (optional)</Label>
        <Controller
          control={control}
          name="secondaryMuscles"
          render={({ field: { value, onChange } }) => (
            <View className="flex-row flex-wrap gap-2">
              {MUSCLE_OPTIONS.map((option) => (
                <ChoiceChip
                  key={option}
                  label={option}
                  selected={value.includes(option)}
                  onPress={() =>
                    onChange(
                      value.includes(option)
                        ? value.filter((item) => item !== option)
                        : [...value, option],
                    )
                  }
                />
              ))}
            </View>
          )}
        />
      </View>

      {errorMessage ? <Text className="text-destructive text-sm">{errorMessage}</Text> : null}

      <Button loading={isSaving} onPress={() => void onSubmit()}>
        <Text>Create exercise</Text>
      </Button>
    </View>
  );
}
