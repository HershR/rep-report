import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import type { NavigationAction } from "@react-navigation/native";
import { format } from "date-fns";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { Alert, Modal, Pressable, StyleSheet, TextInput, View } from "react-native";

import { CustomButton, CustomCard, CustomScreen, CustomText } from "@/components/common";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import { AddSavedExerciseSheet } from "@/features/templates/components/AddSavedExerciseSheet";
import { WorkoutExerciseBlock } from "@/features/workouts/components/WorkoutExerciseBlock";
import { useWorkoutSession } from "@/features/workouts/hooks/useWorkoutSession";
import type {
  WorkoutDetailFormSet,
  WorkoutDetailFormValues,
  WorkoutSessionDetails,
  WorkoutSessionSet,
} from "@/features/workouts/types";
import { workoutDetailFormSchema } from "@/features/workouts/types";
import { spacing, useThemeColors } from "@/theme";

function createTempId(prefix: "exercise" | "set") {
  return `temp-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isTempId(id: string) {
  return id.startsWith("temp-");
}

function areSetsEqual(a: WorkoutSessionSet, b: WorkoutSessionSet) {
  return (
    a.reps === b.reps &&
    a.weight === b.weight &&
    a.durationSeconds === b.durationSeconds &&
    a.distance === b.distance &&
    a.setType === b.setType &&
    a.isCompleted === b.isCompleted
  );
}

function getFormDefaults(session: WorkoutSessionDetails | null): WorkoutDetailFormValues {
  if (!session) {
    return {
      name: "",
      notes: "",
      completedAt: null,
      exercises: [],
    };
  }

  return {
    name: session.name,
    notes: session.notes ?? "",
    completedAt: session.completedAt ?? null,
    exercises: session.exercises.map((exercise) => ({
      ...exercise,
      exercise: { ...exercise.exercise },
      sets: exercise.sets.map((set) => ({
        ...set,
        isCompleted: set.isCompleted === 1 ? 1 : 0,
      })),
    })),
  };
}

export default function WorkoutDetailScreen() {
  const params = useLocalSearchParams<{ workoutId: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const colors = useThemeColors();
  const {
    workoutSession,
    isLoading,
    isSaving,
    refetch,
    addExerciseToWorkout,
    addSetToWorkout,
    removeExerciseFromWorkout,
    updateSet,
    deleteSet,
    updateCompletedWorkout,
    deleteWorkoutSession,
  } = useWorkoutSession(params.workoutId);
  const { favorites } = useFavoriteExercises();

  const [showCompletedAtPicker, setShowCompletedAtPicker] = useState(false);
  const [showAddExerciseSheet, setShowAddExerciseSheet] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const pendingNavigationActionRef = useRef<NavigationAction | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { isDirty },
  } = useForm<WorkoutDetailFormValues>({
    resolver: zodResolver(workoutDetailFormSchema),
    defaultValues: getFormDefaults(workoutSession ?? null),
  });

  const { fields: exerciseFields, append, remove } = useFieldArray({
    control,
    name: "exercises",
  });

  const completedAtDraft = useWatch({ control, name: "completedAt" });
  const watchedExercises = useWatch({ control, name: "exercises" }) ?? [];

  const completedAtDate = useMemo(() => {
    if (!completedAtDraft) return null;
    return new Date(completedAtDraft);
  }, [completedAtDraft]);

  useEffect(() => {
    if (!workoutSession) return;
    reset(getFormDefaults(workoutSession));
  }, [workoutSession, reset]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (!isDirty || isSavingAll) return;
      event.preventDefault();
      pendingNavigationActionRef.current = event.data.action;
      setShowExitModal(true);
    });

    return unsubscribe;
  }, [isDirty, isSavingAll, navigation]);

  if (isLoading || !workoutSession) {
    return (
      <CustomScreen>
        <CustomText muted>Loading workout...</CustomText>
      </CustomScreen>
    );
  }

  const onChangeCompletedAt = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      setShowCompletedAtPicker(false);
      return;
    }
    if (!selectedDate) return;
    setShowCompletedAtPicker(false);
    setValue("completedAt", selectedDate.toISOString(), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onAddExerciseDraft = (exerciseId: string) => {
    const selected = favorites.find((item) => item.id === exerciseId);
    if (!selected) return;
    const now = new Date().toISOString();

    append({
      id: createTempId("exercise"),
      workoutSessionId: workoutSession.id,
      exerciseId: selected.id,
      orderIndex: exerciseFields.length,
      notes: null,
      createdAt: now,
      updatedAt: now,
      exercise: selected,
      sets: [],
    });

    setShowAddExerciseSheet(false);
  };

  const onRemoveExerciseDraft = (workoutSessionExerciseId: string) => {
    const current = getValues("exercises");
    const index = current.findIndex((exercise) => exercise.id === workoutSessionExerciseId);
    if (index < 0) return;

    remove(index);

    const next = getValues("exercises");
    next.forEach((exercise, nextIndex) => {
      setValue(`exercises.${nextIndex}.orderIndex`, nextIndex, {
        shouldDirty: true,
      });
    });
  };

  const onAddSetDraft = (workoutSessionExerciseId: string) => {
    const now = new Date().toISOString();
    const exercises = getValues("exercises");
    const exerciseIndex = exercises.findIndex((exercise) => exercise.id === workoutSessionExerciseId);
    if (exerciseIndex < 0) return;

    const nextSet: WorkoutDetailFormSet = {
      id: createTempId("set"),
      workoutSessionExerciseId,
      orderIndex: exercises[exerciseIndex].sets.length,
      reps: null,
      weight: null,
      durationSeconds: null,
      distance: null,
      isCompleted: 0,
      setType: "normal",
      createdAt: now,
      updatedAt: now,
    };

    setValue(`exercises.${exerciseIndex}.sets`, [...exercises[exerciseIndex].sets, nextSet], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onUpdateSetDraft = (
    setId: string,
    input: {
      reps?: number | null;
      weight?: number | null;
      durationSeconds?: number | null;
      isCompleted?: boolean;
    },
  ) => {
    const exercises = getValues("exercises");

    for (let exerciseIndex = 0; exerciseIndex < exercises.length; exerciseIndex += 1) {
      const setIndex = exercises[exerciseIndex].sets.findIndex((set) => set.id === setId);
      if (setIndex < 0) continue;

      const currentSet = exercises[exerciseIndex].sets[setIndex];
      setValue(
        `exercises.${exerciseIndex}.sets.${setIndex}`,
        {
          ...currentSet,
          ...(input.reps !== undefined ? { reps: input.reps } : {}),
          ...(input.weight !== undefined ? { weight: input.weight } : {}),
          ...(input.durationSeconds !== undefined ? { durationSeconds: input.durationSeconds } : {}),
          ...(input.isCompleted !== undefined ? { isCompleted: input.isCompleted ? 1 : 0 } : {}),
        },
        {
          shouldDirty: true,
          shouldValidate: true,
        },
      );
      return;
    }
  };

  const onDeleteSetDraft = (setId: string) => {
    const exercises = getValues("exercises");

    for (let exerciseIndex = 0; exerciseIndex < exercises.length; exerciseIndex += 1) {
      const setIndex = exercises[exerciseIndex].sets.findIndex((set) => set.id === setId);
      if (setIndex < 0) continue;

      const nextSets = exercises[exerciseIndex].sets
        .filter((set) => set.id !== setId)
        .map((set, index) => ({ ...set, orderIndex: index }));

      setValue(`exercises.${exerciseIndex}.sets`, nextSets, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }
  };

  const onSaveAll = handleSubmit(async (formValues) => {
    if (!workoutSession) return;
    setIsSavingAll(true);

    try {
      await updateCompletedWorkout({
        name: formValues.name,
        notes: formValues.notes.trim() || null,
        completedAt: formValues.completedAt,
      });

      const originalExerciseMap = new Map(
        workoutSession.exercises.map((exercise) => [exercise.id, exercise] as const),
      );
      const nextExerciseIds = new Set(
        formValues.exercises.filter((exercise) => !isTempId(exercise.id)).map((exercise) => exercise.id),
      );

      for (const exercise of workoutSession.exercises) {
        if (!nextExerciseIds.has(exercise.id)) {
          await removeExerciseFromWorkout(exercise.id);
        }
      }

      const resolvedExerciseIds = new Map<string, string>();
      const knownExerciseIds = new Set(originalExerciseMap.keys());

      for (const draftExercise of formValues.exercises) {
        if (!isTempId(draftExercise.id) && originalExerciseMap.has(draftExercise.id)) {
          resolvedExerciseIds.set(draftExercise.id, draftExercise.id);
          continue;
        }

        const session = await addExerciseToWorkout({
          exerciseId: draftExercise.exerciseId,
        });
        const created = session.exercises.find(
          (exercise: WorkoutSessionDetails["exercises"][number]) =>
            exercise.exerciseId === draftExercise.exerciseId &&
            !knownExerciseIds.has(exercise.id),
        );
        if (!created) continue;

        knownExerciseIds.add(created.id);
        resolvedExerciseIds.set(draftExercise.id, created.id);
      }

      for (const draftExercise of formValues.exercises) {
        const realExerciseId = resolvedExerciseIds.get(draftExercise.id) ?? draftExercise.id;
        const originalExercise = originalExerciseMap.get(realExerciseId);
        const originalSetMap = new Map((originalExercise?.sets ?? []).map((set) => [set.id, set] as const));

        const nextSetIds = new Set(
          draftExercise.sets
            .filter((set: WorkoutDetailFormSet) => !isTempId(set.id))
            .map((set: WorkoutDetailFormSet) => set.id),
        );
        for (const set of originalExercise?.sets ?? []) {
          if (!nextSetIds.has(set.id)) {
            await deleteSet(set.id);
          }
        }

        for (const draftSet of draftExercise.sets) {
          const originalSet = originalSetMap.get(draftSet.id);
          if (!originalSet || isTempId(draftSet.id)) {
            await addSetToWorkout({
              workoutSessionExerciseId: realExerciseId,
              reps: draftSet.reps,
              weight: draftSet.weight,
              durationSeconds: draftSet.durationSeconds,
              distance: draftSet.distance,
              isCompleted: draftSet.isCompleted === 1,
              setType: draftSet.setType,
            });
            continue;
          }

          if (!areSetsEqual(originalSet, draftSet)) {
            await updateSet({
              setId: draftSet.id,
              reps: draftSet.reps,
              weight: draftSet.weight,
              durationSeconds: draftSet.durationSeconds,
              distance: draftSet.distance,
              isCompleted: draftSet.isCompleted === 1,
              setType: draftSet.setType,
            });
          }
        }
      }

      await refetch();
      setShowExitModal(false);

      if (pendingNavigationActionRef.current) {
        navigation.dispatch(pendingNavigationActionRef.current);
        pendingNavigationActionRef.current = null;
      }
    } finally {
      setIsSavingAll(false);
    }
  });

  const onDiscardChangesAndLeave = () => {
    setShowExitModal(false);
    if (pendingNavigationActionRef.current) {
      navigation.dispatch(pendingNavigationActionRef.current);
      pendingNavigationActionRef.current = null;
    }
  };

  const onDeleteWorkout = () => {
    Alert.alert("Delete workout?", "This will permanently remove this completed workout.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void (async () => {
            await deleteWorkoutSession();
            router.replace("/(tabs)/home");
          })();
        },
      },
    ]);
  };

  return (
    <CustomScreen scroll contentContainerStyle={styles.container}>
      <CustomText variant="title">Workout Detail</CustomText>

      <CustomCard style={styles.card}>
        <CustomText muted>Name</CustomText>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.surface,
                },
              ]}
              placeholder="Workout name"
              placeholderTextColor={colors.textMuted}
            />
          )}
        />

        <CustomText muted>Notes</CustomText>
        <Controller
          control={control}
          name="notes"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={[
                styles.input,
                styles.notesInput,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.surface,
                },
              ]}
              placeholder="Workout notes"
              placeholderTextColor={colors.textMuted}
            />
          )}
        />
      </CustomCard>

      <CustomCard style={styles.card}>
        <CustomText>{`Completed ${completedAtDate ? format(completedAtDate, "PPP p") : "N/A"}`}</CustomText>
        <CustomText muted>{`Duration ${workoutSession.durationSeconds ?? 0}s`}</CustomText>
        <Pressable onPress={() => setShowCompletedAtPicker(true)}>
          <CustomText muted>Edit completed date/time</CustomText>
        </Pressable>
        {showCompletedAtPicker && completedAtDate ? (
          <DateTimePicker mode="date" value={completedAtDate} onChange={onChangeCompletedAt} />
        ) : null}
      </CustomCard>

      <View style={styles.exerciseList}>
        <View style={styles.exerciseListHeader}>
          <CustomText>Exercises</CustomText>
          <Pressable onPress={() => setShowAddExerciseSheet(true)}>
            <CustomText muted>Add Saved Exercise</CustomText>
          </Pressable>
        </View>
        {watchedExercises.map((exercise) => (
          <WorkoutExerciseBlock
            key={exercise.id}
            workoutExercise={exercise}
            commitSetChangesOnChange
            onAddSet={onAddSetDraft}
            onRemoveExercise={onRemoveExerciseDraft}
            onUpdateSet={onUpdateSetDraft}
            onDeleteSet={onDeleteSetDraft}
          />
        ))}
      </View>

      <CustomButton label="Save All" loading={isSaving || isSavingAll} onPress={() => void onSaveAll()} />
      <CustomButton
        label="Delete Workout"
        loading={isSaving || isSavingAll}
        onPress={onDeleteWorkout}
      />

      <AddSavedExerciseSheet
        visible={showAddExerciseSheet}
        favorites={favorites}
        onClose={() => setShowAddExerciseSheet(false)}
        onAddExercise={(exercise) => onAddExerciseDraft(exercise.id)}
      />

      <Modal
        visible={showExitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <CustomCard style={styles.modalCard}>
            <CustomText>Unsaved changes</CustomText>
            <CustomText muted>Save changes before leaving this workout?</CustomText>
            <View style={styles.modalActions}>
              <CustomButton label="Save" loading={isSavingAll} onPress={() => void onSaveAll()} />
              <CustomButton label="Discard" onPress={onDiscardChangesAndLeave} />
              <CustomButton label="Cancel" onPress={() => setShowExitModal(false)} />
            </View>
          </CustomCard>
        </View>
      </Modal>
    </CustomScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    gap: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  notesInput: {
    minHeight: 90,
  },
  exerciseList: {
    gap: spacing.sm,
  },
  exerciseListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalCard: {
    gap: spacing.md,
  },
  modalActions: {
    gap: spacing.sm,
  },
});
