import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import type { NavigationAction } from "@react-navigation/native";
import { format } from "date-fns";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";

import { CustomScreen } from "@/components/common";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
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

function getFormDefaults(
  session: WorkoutSessionDetails | null,
): WorkoutDetailFormValues {
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const pendingNavigationActionRef = useRef<NavigationAction | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { isDirty, errors },
  } = useForm<WorkoutDetailFormValues>({
    resolver: zodResolver(workoutDetailFormSchema),
    defaultValues: getFormDefaults(workoutSession ?? null),
  });

  const {
    fields: exerciseFields,
    append,
    remove,
  } = useFieldArray({
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
        <View className="flex-1 items-center justify-center gap-2">
          <ActivityIndicator />
          <Text variant="muted">Loading workout...</Text>
        </View>
      </CustomScreen>
    );
  }

  const onChangeCompletedAt = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
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
    const index = current.findIndex(
      (exercise) => exercise.id === workoutSessionExerciseId,
    );
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
    const exerciseIndex = exercises.findIndex(
      (exercise) => exercise.id === workoutSessionExerciseId,
    );
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

    setValue(
      `exercises.${exerciseIndex}.sets`,
      [...exercises[exerciseIndex].sets, nextSet],
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  };

  const onUpdateSetDraft = (
    setId: string,
    input: {
      reps?: number | null;
      weight?: number | null;
      durationSeconds?: number | null;
      distance?: number | null;
      isCompleted?: boolean;
    },
  ) => {
    const exercises = getValues("exercises");

    for (
      let exerciseIndex = 0;
      exerciseIndex < exercises.length;
      exerciseIndex += 1
    ) {
      const setIndex = exercises[exerciseIndex].sets.findIndex(
        (set) => set.id === setId,
      );
      if (setIndex < 0) continue;

      const currentSet = exercises[exerciseIndex].sets[setIndex];
      setValue(
        `exercises.${exerciseIndex}.sets.${setIndex}`,
        {
          ...currentSet,
          ...(input.reps !== undefined ? { reps: input.reps } : {}),
          ...(input.weight !== undefined ? { weight: input.weight } : {}),
          ...(input.durationSeconds !== undefined
            ? { durationSeconds: input.durationSeconds }
            : {}),
          ...(input.distance !== undefined ? { distance: input.distance } : {}),
          ...(input.isCompleted !== undefined
            ? { isCompleted: input.isCompleted ? 1 : 0 }
            : {}),
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

    for (
      let exerciseIndex = 0;
      exerciseIndex < exercises.length;
      exerciseIndex += 1
    ) {
      const setIndex = exercises[exerciseIndex].sets.findIndex(
        (set) => set.id === setId,
      );
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
        workoutSession.exercises.map(
          (exercise) => [exercise.id, exercise] as const,
        ),
      );
      const nextExerciseIds = new Set(
        formValues.exercises
          .filter((exercise) => !isTempId(exercise.id))
          .map((exercise) => exercise.id),
      );

      for (const exercise of workoutSession.exercises) {
        if (!nextExerciseIds.has(exercise.id)) {
          await removeExerciseFromWorkout(exercise.id);
        }
      }

      const resolvedExerciseIds = new Map<string, string>();
      const knownExerciseIds = new Set(originalExerciseMap.keys());

      for (const draftExercise of formValues.exercises) {
        if (
          !isTempId(draftExercise.id) &&
          originalExerciseMap.has(draftExercise.id)
        ) {
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
        const realExerciseId =
          resolvedExerciseIds.get(draftExercise.id) ?? draftExercise.id;
        const originalExercise = originalExerciseMap.get(realExerciseId);
        const originalSetMap = new Map(
          (originalExercise?.sets ?? []).map((set) => [set.id, set] as const),
        );

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

  const onDeleteWorkout = async () => {
    await deleteWorkoutSession();
    router.back();
  };

  return (
    <CustomScreen scroll contentContainerStyle={{ gap: 16, paddingBottom: 32 }}>
      <Text variant="h2">Workout Detail</Text>

      <Card>
        <CardContent className="gap-4">
          <View className="gap-2">
            <Label>Name</Label>
            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder="Workout name"
                />
              )}
            />
            {errors.name?.message ? (
              <Text className="text-destructive text-sm">
                {errors.name.message}
              </Text>
            ) : null}
          </View>

          <View className="gap-2">
            <Label>Notes</Label>
            <Controller
              control={control}
              name="notes"
              render={({ field: { value, onChange } }) => (
                <Textarea
                  value={value}
                  onChangeText={onChange}
                  placeholder="Workout notes"
                  placeholderClassName="text-muted-foreground/50"
                />
              )}
            />
          </View>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="gap-2">
          <Text>{`Completed ${completedAtDate ? format(completedAtDate, "PPP p") : "N/A"}`}</Text>
          <Text variant="muted">{`Duration ${workoutSession.durationSeconds ?? 0}s`}</Text>
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            onPress={() => setShowCompletedAtPicker(true)}
          >
            <Text>Edit completed date/time</Text>
          </Button>
          {showCompletedAtPicker && completedAtDate ? (
            <DateTimePicker
              mode="date"
              value={completedAtDate}
              onChange={onChangeCompletedAt}
            />
          ) : null}
        </CardContent>
      </Card>

      <View className="gap-3">
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
        {watchedExercises.map((exercise, index) => (
          <View key={exercise.id} className="gap-3">
            {index > 0 ? <Separator /> : null}
            <WorkoutExerciseBlock
              workoutExercise={exercise}
              commitSetChangesOnChange
              onAddSet={onAddSetDraft}
              onRemoveExercise={onRemoveExerciseDraft}
              onUpdateSet={onUpdateSetDraft}
              onDeleteSet={onDeleteSetDraft}
            />
          </View>
        ))}
      </View>

      <Button
        loading={isSaving || isSavingAll}
        onPress={() => void onSaveAll()}
      >
        <Text>Save All</Text>
      </Button>
      <Button
        variant="destructive"
        loading={isSaving || isSavingAll}
        onPress={() => setShowDeleteConfirm(true)}
      >
        <Text>Delete Workout</Text>
      </Button>

      <AddSavedExerciseSheet
        visible={showAddExerciseSheet}
        favorites={favorites}
        onClose={() => setShowAddExerciseSheet(false)}
        onAddExercise={(exercise) => onAddExerciseDraft(exercise.id)}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete workout?"
        description="This will permanently remove this completed workout."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          setShowDeleteConfirm(false);
          void onDeleteWorkout();
        }}
      />

      <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved changes</DialogTitle>
            <DialogDescription>
              Save changes before leaving this workout?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onPress={() => setShowExitModal(false)}>
              <Text>Cancel</Text>
            </Button>
            <Button variant="destructive" onPress={onDiscardChangesAndLeave}>
              <Text>Discard</Text>
            </Button>
            <Button loading={isSavingAll} onPress={() => void onSaveAll()}>
              <Text>Save</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CustomScreen>
  );
}
