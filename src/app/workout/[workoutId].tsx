import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import type { NavigationAction } from "@react-navigation/native";
import { format, set } from "date-fns";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { MoreHorizontal } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { toast } from "sonner-native";

import { CustomScreen, ScreenHeader } from "@/components/common";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import { AddSavedExerciseSheet } from "@/features/templates/components/AddSavedExerciseSheet";
import { ExerciseListSkeleton } from "@/features/workouts/components/ExerciseListSkeleton";
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
      startedAt: new Date().toISOString(),
      completedAt: null,
      exercises: [],
    };
  }

  return {
    name: session.name,
    notes: session.notes ?? "",
    startedAt: session.startedAt,
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
    error,
    isSaving,
    refetch,
    addExerciseToWorkout,
    addSetToWorkout,
    removeExerciseFromWorkout,
    reorderExercises,
    updateSet,
    deleteSet,
    updateCompletedWorkout,
    deleteWorkoutSession,
  } = useWorkoutSession(params.workoutId);
  const { favorites } = useFavoriteExercises();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [totalText, setTotalText] = useState("");
  const [totalFocused, setTotalFocused] = useState(false);
  const [showAddExerciseSheet, setShowAddExerciseSheet] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
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
    move,
  } = useFieldArray({
    control,
    name: "exercises",
  });

  const nameDraft = useWatch({ control, name: "name" });
  const completedAtDraft = useWatch({ control, name: "completedAt" });
  const startedAtDraft = useWatch({ control, name: "startedAt" });
  const watchedExercises = useWatch({ control, name: "exercises" }) ?? [];

  const completedAtDate = useMemo(() => {
    if (!completedAtDraft) return null;
    return new Date(completedAtDraft);
  }, [completedAtDraft]);

  const startedAtDate = useMemo(() => {
    if (!startedAtDraft) return null;
    return new Date(startedAtDraft);
  }, [startedAtDraft]);

  const durationSeconds = useMemo(() => {
    if (!startedAtDraft || !completedAtDraft) return 0;
    return Math.max(
      0,
      Math.floor(
        (Date.parse(completedAtDraft) - Date.parse(startedAtDraft)) / 1000,
      ),
    );
  }, [startedAtDraft, completedAtDraft]);

  useEffect(() => {
    if (!workoutSession) return;
    reset(getFormDefaults(workoutSession));
  }, [workoutSession, reset]);

  // Keep the total-minutes field in sync with start/end, but not while the user
  // is typing in it (rounding to whole minutes would fight their input), same
  // focus-guard pattern as WorkoutSetRow's duration field.
  useEffect(() => {
    if (totalFocused) return;
    setTotalText(String(Math.round(durationSeconds / 60)));
  }, [durationSeconds, totalFocused]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (!isDirty || isSavingAll) return;
      event.preventDefault();
      pendingNavigationActionRef.current = event.data.action;
      setShowExitModal(true);
    });

    return unsubscribe;
  }, [isDirty, isSavingAll, navigation]);

  if (error) {
    return (
      <CustomScreen>
        <View className="flex-1 items-center justify-center gap-3">
          <Text className="text-destructive text-sm">
            Could not load this workout.
          </Text>
          <View className="flex-row gap-2">
            <Button variant="outline" size="sm" onPress={() => void refetch()}>
              <Text>Retry</Text>
            </Button>
            <Button variant="ghost" size="sm" onPress={() => router.back()}>
              <Text>Go back</Text>
            </Button>
          </View>
        </View>
      </CustomScreen>
    );
  }

  if (isLoading) {
    return (
      <CustomScreen>
        <View className="pt-4">
          <ExerciseListSkeleton />
        </View>
      </CustomScreen>
    );
  }

  if (!workoutSession) {
    return (
      <CustomScreen>
        <View className="flex-1 items-center justify-center gap-3">
          <Text variant="muted">This workout no longer exists.</Text>
          <Button variant="outline" size="sm" onPress={() => router.back()}>
            <Text>Go back</Text>
          </Button>
        </View>
      </CustomScreen>
    );
  }

  // Date applies the chosen day to both timestamps (times preserved).
  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === "dismissed" || !selectedDate) return;
    const ymd = {
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth(),
      date: selectedDate.getDate(),
    };
    if (startedAtDate) {
      setValue("startedAt", set(startedAtDate, ymd).toISOString(), {
        shouldDirty: true,
      });
    }
    if (completedAtDate) {
      setValue("completedAt", set(completedAtDate, ymd).toISOString(), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  // Start time moves startedAt; end stays put, so total recomputes from it.
  const onChangeStartTime = (
    event: DateTimePickerEvent,
    selectedTime?: Date,
  ) => {
    setShowStartPicker(false);
    if (event.type === "dismissed" || !selectedTime || !startedAtDate) return;
    const nextStart = set(startedAtDate, {
      hours: selectedTime.getHours(),
      minutes: selectedTime.getMinutes(),
      seconds: 0,
      milliseconds: 0,
    });
    setValue("startedAt", nextStart.toISOString(), { shouldDirty: true });
  };

  // End time moves completedAt; start stays put, so total recomputes (rule 2).
  const onChangeEndTime = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowEndPicker(false);
    if (event.type === "dismissed" || !selectedTime || !completedAtDate) return;
    const nextEnd = set(completedAtDate, {
      hours: selectedTime.getHours(),
      minutes: selectedTime.getMinutes(),
      seconds: 0,
      milliseconds: 0,
    });
    setValue("completedAt", nextEnd.toISOString(), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // Total drives the end: completedAt = startedAt + total (start fixed, rule 1).
  const onCommitTotal = () => {
    setTotalFocused(false);
    if (!startedAtDate) return;
    const minutes = Number(totalText) || 0;
    const nextEnd = new Date(startedAtDate.getTime() + minutes * 60 * 1000);
    setValue("completedAt", nextEnd.toISOString(), {
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
        startedAt: formValues.startedAt,
        completedAt: formValues.completedAt,
        durationSeconds: formValues.completedAt
          ? Math.max(
              0,
              Math.floor(
                (Date.parse(formValues.completedAt) -
                  Date.parse(formValues.startedAt)) /
                  1000,
              ),
            )
          : null,
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

      const orderedExerciseIds = formValues.exercises.map(
        (draftExercise) =>
          resolvedExerciseIds.get(draftExercise.id) ?? draftExercise.id,
      );
      if (orderedExerciseIds.length > 0) {
        await reorderExercises(orderedExerciseIds);
      }

      await refetch();
      setShowExitModal(false);
      toast.success("Workout saved");

      if (pendingNavigationActionRef.current) {
        navigation.dispatch(pendingNavigationActionRef.current);
        pendingNavigationActionRef.current = null;
      }
    } catch {
      // Keep the user on the screen with their edits intact.
      toast.error("Could not save this workout. Your changes are still here.");
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
    try {
      await deleteWorkoutSession();
    } catch {
      toast.error("Could not delete this workout.");
      return;
    }
    router.back();
  };

  const onRepeatWorkout = async () => {
    if (isDirty) await onSaveAll();
    router.push({
      pathname: "/workout/active",
      params: { repeatSessionId: workoutSession.id },
    });
  };

  return (
    <CustomScreen>
      <ScreenHeader
        title={nameDraft?.trim() ? nameDraft : "Workout"}
        showBack
        className="pb-3"
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          accessibilityLabel="Workout options"
          onPress={() => setShowOptions(true)}
        >
          <Icon as={MoreHorizontal} className="text-foreground" />
        </Button>
        <Button
          size="sm"
          loading={isSaving || isSavingAll}
          onPress={() => void onSaveAll()}
        >
          <Text>Save</Text>
        </Button>
      </ScreenHeader>

      {/* Exercises are the focus: they scroll, everything else is chrome. */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="muted" className="text-xs">
          {`${completedAtDate ? format(completedAtDate, "PP") : "No date"} · ${Math.round(durationSeconds / 60)} min`}
        </Text>

        {watchedExercises.length === 0 ? (
          <Text variant="muted" className="py-8 text-center">
            No exercises yet. Add one below to get started.
          </Text>
        ) : (
          watchedExercises.map((exercise, index) => (
            <View key={exercise.id} className="gap-3">
              {index > 0 ? <Separator /> : null}
              <WorkoutExerciseBlock
                workoutExercise={exercise}
                commitSetChangesOnChange
                onAddSet={onAddSetDraft}
                onRemoveExercise={onRemoveExerciseDraft}
                onUpdateSet={onUpdateSetDraft}
                onDeleteSet={onDeleteSetDraft}
                onMoveUp={() => move(index, index - 1)}
                onMoveDown={() => move(index, index + 1)}
                canMoveUp={index > 0}
                canMoveDown={index < watchedExercises.length - 1}
              />
            </View>
          ))
        )}

        <Button
          variant="outline"
          className="mt-2"
          onPress={() => setShowAddExerciseSheet(true)}
        >
          <Text>Add Exercise</Text>
        </Button>
      </ScrollView>

      {/* Options: workout details (name/notes/date/time) + workout actions. */}
      <Sheet open={showOptions} onOpenChange={setShowOptions}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Workout options</SheetTitle>
          </SheetHeader>

          <View className="gap-4">
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

            <View className="flex-row items-center justify-between">
              <Text variant="muted">Date</Text>
              <Button
                variant="outline"
                size="sm"
                onPress={() => setShowDatePicker(true)}
              >
                <Text>
                  {completedAtDate ? format(completedAtDate, "PPP") : "Set date"}
                </Text>
              </Button>
            </View>

            <View className="flex-row items-center justify-between">
              <Text variant="muted">Start time</Text>
              <Button
                variant="outline"
                size="sm"
                onPress={() => setShowStartPicker(true)}
              >
                <Text>
                  {startedAtDate ? format(startedAtDate, "p") : "Set start"}
                </Text>
              </Button>
            </View>

            <View className="flex-row items-center justify-between">
              <Text variant="muted">End time</Text>
              <Button
                variant="outline"
                size="sm"
                onPress={() => setShowEndPicker(true)}
              >
                <Text>
                  {completedAtDate ? format(completedAtDate, "p") : "Set end"}
                </Text>
              </Button>
            </View>

            <View className="gap-1.5">
              <Label>Total workout time (minutes)</Label>
              <Input
                value={totalText}
                onChangeText={(text) =>
                  setTotalText(text.replace(/\D/g, "").slice(0, 4))
                }
                onFocus={() => setTotalFocused(true)}
                onBlur={onCommitTotal}
                keyboardType="number-pad"
                placeholder="0"
              />
            </View>

            {showDatePicker && completedAtDate ? (
              <DateTimePicker
                mode="date"
                value={completedAtDate}
                onChange={onChangeDate}
              />
            ) : null}
            {showStartPicker && startedAtDate ? (
              <DateTimePicker
                mode="time"
                value={startedAtDate}
                onChange={onChangeStartTime}
              />
            ) : null}
            {showEndPicker && completedAtDate ? (
              <DateTimePicker
                mode="time"
                value={completedAtDate}
                onChange={onChangeEndTime}
              />
            ) : null}

            <Separator className="my-1" />

            <Button
              variant="outline"
              loading={isSaving || isSavingAll}
              onPress={() => {
                setShowOptions(false);
                void onRepeatWorkout();
              }}
            >
              <Text>Repeat Workout</Text>
            </Button>
            <Button
              variant="destructive"
              onPress={() => {
                setShowOptions(false);
                setShowDeleteConfirm(true);
              }}
            >
              <Text>Delete Workout</Text>
            </Button>
          </View>
        </SheetContent>
      </Sheet>

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
