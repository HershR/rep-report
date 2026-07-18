import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { View } from "react-native";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormSetValue,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { AddSavedExerciseSheet } from "@/features/templates/components/AddSavedExerciseSheet";
import { TemplateExerciseBlock } from "@/features/templates/components/TemplateExerciseBlock";
import {
  templateEditorFormSchema,
  type TemplateEditorFormValues,
  type TemplateEditorSet,
  type TemplateEditorValue,
  type WorkoutTemplate,
} from "@/features/templates/types";
import type { Exercise } from "@/features/exercises/types";

type TemplateEditorProps = {
  initialTemplate?: WorkoutTemplate | null;
  favorites: Exercise[];
  isSaving?: boolean;
  onSave: (value: TemplateEditorValue) => Promise<void>;
};

function createLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function numberToText(value: number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

function getDefaultValues(
  template?: WorkoutTemplate | null,
): TemplateEditorFormValues {
  if (!template) {
    return {
      name: "",
      description: "",
      exercises: [],
    };
  }

  return {
    name: template.name,
    description: template.description ?? "",
    exercises: template.exercises.map((templateExercise) => ({
      id: templateExercise.id,
      localId: createLocalId(),
      exerciseId: templateExercise.exerciseId,
      exerciseName: templateExercise.exercise.name,
      exerciseCategory: templateExercise.exercise.category,
      orderIndex: templateExercise.orderIndex,
      sets: templateExercise.sets.map((set) => ({
        id: set.id,
        localId: createLocalId(),
        repsText: numberToText(set.targetReps),
        weightText: numberToText(set.targetWeight),
        durationText: numberToText(set.targetDurationSeconds),
        distanceText: numberToText(set.targetDistance),
      })),
    })),
  };
}

function mapFormToEditorValue(
  value: TemplateEditorFormValues,
): TemplateEditorValue {
  return {
    name: value.name.trim(),
    description: value.description.trim() || null,
    exercises: value.exercises.map((exercise, index) => ({
      ...exercise,
      orderIndex: index,
    })),
  };
}

function getErrorMessage(
  errors: FieldErrors<TemplateEditorFormValues>,
): string | null {
  if (errors.name?.message) return errors.name.message;
  if (errors.description?.message) return errors.description.message;
  if (errors.exercises?.message) return errors.exercises.message;

  const exerciseErrors = Array.isArray(errors.exercises)
    ? errors.exercises
    : [];
  for (const exerciseError of exerciseErrors) {
    if (!exerciseError) continue;
    if (exerciseError.message) return exerciseError.message;
    if (exerciseError.exerciseName?.message)
      return exerciseError.exerciseName.message;

    const setErrors = Array.isArray(exerciseError.sets)
      ? exerciseError.sets
      : [];
    for (const setError of setErrors) {
      if (!setError) continue;
      if (setError.message) return setError.message;
      if (setError.repsText?.message) return setError.repsText.message;
      if (setError.weightText?.message) return setError.weightText.message;
      if (setError.durationText?.message) return setError.durationText.message;
      if (setError.distanceText?.message) return setError.distanceText.message;
    }
  }

  return null;
}

type ExerciseFieldProps = {
  control: Control<TemplateEditorFormValues>;
  setValue: UseFormSetValue<TemplateEditorFormValues>;
  index: number;
  onDeleteExercise: () => void;
};

function ExerciseField({
  control,
  setValue,
  index,
  onDeleteExercise,
}: ExerciseFieldProps) {
  const exercise = useWatch({
    control,
    name: `exercises.${index}`,
  });

  const { append, remove } = useFieldArray({
    control,
    name: `exercises.${index}.sets`,
  });

  const onAddSet = () => {
    append({
      localId: createLocalId(),
      repsText: "",
      weightText: "",
      durationText: "",
      distanceText: "",
    });
  };

  const onUpdateSet = (
    setIndex: number,
    field: keyof Pick<
      TemplateEditorSet,
      "repsText" | "weightText" | "durationText" | "distanceText"
    >,
    value: string,
  ) => {
    setValue(`exercises.${index}.sets.${setIndex}.${field}`, value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  if (!exercise) return null;

  return (
    <TemplateExerciseBlock
      exerciseName={exercise.exerciseName}
      exerciseCategory={exercise.exerciseCategory}
      sets={exercise.sets}
      onAddSet={onAddSet}
      onDeleteExercise={onDeleteExercise}
      onDeleteSet={(setLocalId) => {
        const setIndex = exercise.sets.findIndex(
          (set) => set.localId === setLocalId,
        );
        if (setIndex >= 0) remove(setIndex);
      }}
      onUpdateSet={(setLocalId, field, value) => {
        const setIndex = exercise.sets.findIndex(
          (set) => set.localId === setLocalId,
        );
        if (setIndex >= 0) onUpdateSet(setIndex, field, value);
      }}
    />
  );
}

export function TemplateEditor({
  initialTemplate,
  favorites,
  isSaving = false,
  onSave,
}: TemplateEditorProps) {
  const [showAddExerciseSheet, setShowAddExerciseSheet] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TemplateEditorFormValues>({
    resolver: zodResolver(templateEditorFormSchema),
    defaultValues: getDefaultValues(initialTemplate),
  });

  const {
    fields: exerciseFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "exercises",
  });

  useEffect(() => {
    reset(getDefaultValues(initialTemplate));
  }, [initialTemplate, reset]);

  const onAddExercise = (exercise: Exercise) => {
    append({
      localId: createLocalId(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      exerciseCategory: exercise.category,
      orderIndex: exerciseFields.length,
      sets: [],
    });
  };

  const onDeleteExercise = (index: number) => {
    remove(index);
    const nextCount = exerciseFields.length - 1;
    for (let nextIndex = index; nextIndex < nextCount; nextIndex += 1) {
      setValue(`exercises.${nextIndex}.orderIndex`, nextIndex, {
        shouldDirty: true,
      });
    }
  };

  const onSubmit = handleSubmit(async (value) => {
    await onSave(mapFormToEditorValue(value));
  });

  const errorMessage = getErrorMessage(errors);

  return (
    <View className="mt-4 gap-4 pb-8">
      <View className="gap-2">
        <Label>Template name</Label>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange } }) => (
            <Input
              value={value}
              onChangeText={onChange}
              placeholder="Template name"
            />
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

      {errorMessage ? (
        <Text className="text-destructive text-sm">{errorMessage}</Text>
      ) : null}

      <View className="flex-row items-center justify-between">
        <Text variant="large">Exercises</Text>
        <Button
          variant="outline"
          size="sm"
          onPress={() => setShowAddExerciseSheet(true)}
        >
          <Text>Add Saved Exercise</Text>
        </Button>
      </View>

      {exerciseFields.length === 0 ? (
        <Text variant="muted">No exercises added yet.</Text>
      ) : (
        <View className="gap-3">
          {exerciseFields.map((exercise, index) => (
            <ExerciseField
              key={exercise.id}
              control={control}
              setValue={setValue}
              index={index}
              onDeleteExercise={() => onDeleteExercise(index)}
            />
          ))}
        </View>
      )}

      <Button loading={isSaving} onPress={() => void onSubmit()}>
        <Text>Save Template</Text>
      </Button>

      <AddSavedExerciseSheet
        visible={showAddExerciseSheet}
        favorites={favorites}
        onClose={() => setShowAddExerciseSheet(false)}
        onAddExercise={onAddExercise}
      />
    </View>
  );
}
