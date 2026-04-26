import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { CustomButton, CustomText } from "@/components/common";
import { AddSavedExerciseSheet } from "@/features/templates/components/AddSavedExerciseSheet";
import { TemplateExerciseBlock } from "@/features/templates/components/TemplateExerciseBlock";
import {
  templateNameSchema,
  templateSetSchema,
  type WorkoutTemplate,
} from "@/features/templates/types";
import type { Exercise } from "@/features/exercises/types";
import { spacing, useThemeColors } from "@/theme";

type EditorSet = {
  id?: string;
  localId: string;
  repsText: string;
  weightText: string;
  durationText: string;
};

type EditorExercise = {
  id?: string;
  localId: string;
  exerciseId: string;
  exerciseName: string;
  orderIndex: number;
  sets: EditorSet[];
};

export type TemplateEditorValue = {
  name: string;
  description: string | null;
  exercises: EditorExercise[];
};

type TemplateEditorProps = {
  initialTemplate?: WorkoutTemplate | null;
  favorites: Exercise[];
  isSaving?: boolean;
  onSave: (value: TemplateEditorValue) => Promise<void>;
};

function createLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function numberToText(value: number | null): string {
  return value === null ? "" : String(value);
}

function textToNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function TemplateEditor({ initialTemplate, favorites, isSaving = false, onSave }: TemplateEditorProps) {
  const colors = useThemeColors();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [exercises, setExercises] = useState<EditorExercise[]>([]);
  const [showAddExerciseSheet, setShowAddExerciseSheet] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!initialTemplate) return;
    setName(initialTemplate.name);
    setDescription(initialTemplate.description ?? "");
    setExercises(
      initialTemplate.exercises.map((templateExercise) => ({
        id: templateExercise.id,
        localId: createLocalId(),
        exerciseId: templateExercise.exerciseId,
        exerciseName: templateExercise.exercise.name,
        orderIndex: templateExercise.orderIndex,
        sets: templateExercise.sets.map((set) => ({
          id: set.id,
          localId: createLocalId(),
          repsText: numberToText(set.targetReps),
          weightText: numberToText(set.targetWeight),
          durationText: numberToText(set.targetDurationSeconds),
        })),
      })),
    );
  }, [initialTemplate]);

  const selectedExerciseIds = useMemo(() => exercises.map((item) => item.exerciseId), [exercises]);

  const onAddExercise = (exercise: Exercise) => {
    setExercises((prev) => [
      ...prev,
      {
        localId: createLocalId(),
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        orderIndex: prev.length,
        sets: [],
      },
    ]);
    setShowAddExerciseSheet(false);
  };

  const onAddSet = (exerciseLocalId: string) => {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.localId === exerciseLocalId
          ? {
              ...exercise,
              sets: [
                ...exercise.sets,
                {
                  localId: createLocalId(),
                  repsText: "",
                  weightText: "",
                  durationText: "",
                },
              ],
            }
          : exercise,
      ),
    );
  };

  const onDeleteExercise = (exerciseLocalId: string) => {
    setExercises((prev) =>
      prev.filter((exercise) => exercise.localId !== exerciseLocalId).map((exercise, index) => ({
        ...exercise,
        orderIndex: index,
      })),
    );
  };

  const onDeleteSet = (exerciseLocalId: string, setLocalId: string) => {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.localId === exerciseLocalId
          ? { ...exercise, sets: exercise.sets.filter((set) => set.localId !== setLocalId) }
          : exercise,
      ),
    );
  };

  const onUpdateSet = (
    exerciseLocalId: string,
    setLocalId: string,
    field: "repsText" | "weightText" | "durationText",
    value: string,
  ) => {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.localId === exerciseLocalId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.localId === setLocalId ? { ...set, [field]: value } : set,
              ),
            }
          : exercise,
      ),
    );
  };

  const onPressSave = async () => {
    const nameValidation = templateNameSchema.safeParse(name);
    if (!nameValidation.success) {
      setErrorMessage(nameValidation.error.issues[0]?.message ?? "Template name is required.");
      return;
    }

    for (const exercise of exercises) {
      for (const set of exercise.sets) {
        const parsed = {
          targetReps: textToNumber(set.repsText),
          targetWeight: textToNumber(set.weightText),
          targetDurationSeconds: textToNumber(set.durationText),
        };
        const result = templateSetSchema.safeParse(parsed);
        if (!result.success) {
          setErrorMessage(result.error.issues[0]?.message ?? "Set values must be 0 or greater.");
          return;
        }
      }
    }

    setErrorMessage(null);
    await onSave({
      name: nameValidation.data,
      description: description.trim() || null,
      exercises,
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Template name"
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Description (optional)"
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      {errorMessage ? <CustomText muted>{errorMessage}</CustomText> : null}

      <View style={styles.exerciseHeader}>
        <CustomText>Exercises</CustomText>
        <Pressable onPress={() => setShowAddExerciseSheet(true)}>
          <CustomText muted>Add Saved Exercise</CustomText>
        </Pressable>
      </View>

      {exercises.length === 0 ? (
        <CustomText muted>No exercises added yet.</CustomText>
      ) : (
        exercises.map((exercise) => (
          <TemplateExerciseBlock
            key={exercise.localId}
            exerciseName={exercise.exerciseName}
            sets={exercise.sets}
            onAddSet={() => onAddSet(exercise.localId)}
            onDeleteExercise={() => onDeleteExercise(exercise.localId)}
            onDeleteSet={(setLocalId) => onDeleteSet(exercise.localId, setLocalId)}
            onUpdateSet={(setLocalId, field, value) =>
              onUpdateSet(exercise.localId, setLocalId, field, value)
            }
          />
        ))
      )}

      <CustomButton label="Save Template" loading={isSaving} onPress={() => void onPressSave()} />

      <AddSavedExerciseSheet
        visible={showAddExerciseSheet}
        favorites={favorites}
        selectedExerciseIds={selectedExerciseIds}
        onClose={() => setShowAddExerciseSheet(false)}
        onAddExercise={onAddExercise}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    marginTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  input: {
    borderWidth: 1,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
