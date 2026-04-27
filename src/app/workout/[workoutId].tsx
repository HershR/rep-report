import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useNavigation, useLocalSearchParams } from "expo-router";
import { format } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, TextInput, View } from "react-native";
import type { NavigationAction } from "@react-navigation/native";

import {
  CustomButton,
  CustomCard,
  CustomScreen,
  CustomText,
} from "@/components/common";
import { AddSavedExerciseSheet } from "@/features/templates/components/AddSavedExerciseSheet";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import { WorkoutExerciseBlock } from "@/features/workouts/components/WorkoutExerciseBlock";
import { useWorkoutSession } from "@/features/workouts/hooks/useWorkoutSession";
import type {
  WorkoutSessionDetails,
  WorkoutSessionSet,
} from "@/features/workouts/types";
import { spacing, useThemeColors } from "@/theme";

function createTempId(prefix: "exercise" | "set") {
  return `temp-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isTempId(id: string) {
  return id.startsWith("temp-");
}

function cloneWorkoutSession(session: WorkoutSessionDetails): WorkoutSessionDetails {
  return {
    ...session,
    exercises: session.exercises.map((exercise) => ({
      ...exercise,
      exercise: { ...exercise.exercise },
      sets: exercise.sets.map((set) => ({ ...set })),
    })),
  };
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

export default function WorkoutDetailScreen() {
  const params = useLocalSearchParams<{ workoutId: string }>();
  const navigation = useNavigation();
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
  } = useWorkoutSession(params.workoutId);
  const { favorites } = useFavoriteExercises();

  const [draftSession, setDraftSession] = useState<WorkoutSessionDetails | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const [completedAtDraft, setCompletedAtDraft] = useState<string | null>(null);
  const [showCompletedAtPicker, setShowCompletedAtPicker] = useState(false);
  const [showAddExerciseSheet, setShowAddExerciseSheet] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const pendingNavigationActionRef = useRef<NavigationAction | null>(null);

  const completedAtDate = useMemo(() => {
    if (!completedAtDraft) return null;
    return new Date(completedAtDraft);
  }, [completedAtDraft]);

  useEffect(() => {
    if (!workoutSession) return;
    setDraftSession(cloneWorkoutSession(workoutSession));
    setNameDraft(workoutSession.name);
    setNotesDraft(workoutSession.notes ?? "");
    setCompletedAtDraft(workoutSession.completedAt ?? null);
    setHasUnsavedChanges(false);
  }, [workoutSession]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (!hasUnsavedChanges || isSavingAll) return;
      event.preventDefault();
      pendingNavigationActionRef.current = event.data.action;
      setShowExitModal(true);
    });

    return unsubscribe;
  }, [hasUnsavedChanges, isSavingAll, navigation]);

  if (isLoading || !workoutSession || !draftSession) {
    return (
      <CustomScreen>
        <CustomText muted>Loading workout...</CustomText>
      </CustomScreen>
    );
  }

  const markDirty = () => setHasUnsavedChanges(true);

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
    setCompletedAtDraft(selectedDate.toISOString());
    markDirty();
  };

  const onAddExerciseDraft = (exerciseId: string) => {
    const selected = favorites.find((item) => item.id === exerciseId);
    if (!selected) return;

    const now = new Date().toISOString();
    const tempExerciseId = createTempId("exercise");
    setDraftSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: [
          ...prev.exercises,
          {
            id: tempExerciseId,
            workoutSessionId: prev.id,
            exerciseId: selected.id,
            orderIndex: prev.exercises.length,
            notes: null,
            createdAt: now,
            updatedAt: now,
            exercise: selected,
            sets: [],
          },
        ],
      };
    });
    setShowAddExerciseSheet(false);
    markDirty();
  };

  const onRemoveExerciseDraft = (workoutSessionExerciseId: string) => {
    setDraftSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises
          .filter((exercise) => exercise.id !== workoutSessionExerciseId)
          .map((exercise, index) => ({ ...exercise, orderIndex: index })),
      };
    });
    markDirty();
  };

  const onAddSetDraft = (workoutSessionExerciseId: string) => {
    const now = new Date().toISOString();
    setDraftSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.map((exercise) => {
          if (exercise.id !== workoutSessionExerciseId) return exercise;
          return {
            ...exercise,
            sets: [
              ...exercise.sets,
              {
                id: createTempId("set"),
                workoutSessionExerciseId: exercise.id,
                orderIndex: exercise.sets.length,
                reps: null,
                weight: null,
                durationSeconds: null,
                distance: null,
                isCompleted: 0,
                setType: "normal",
                createdAt: now,
                updatedAt: now,
              },
            ],
          };
        }),
      };
    });
    markDirty();
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
    setDraftSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.map((exercise) => ({
          ...exercise,
          sets: exercise.sets.map((set) =>
            set.id === setId
              ? {
                  ...set,
                  ...(input.reps !== undefined ? { reps: input.reps } : {}),
                  ...(input.weight !== undefined ? { weight: input.weight } : {}),
                  ...(input.durationSeconds !== undefined
                    ? { durationSeconds: input.durationSeconds }
                    : {}),
                  ...(input.isCompleted !== undefined
                    ? { isCompleted: input.isCompleted ? 1 : 0 }
                    : {}),
                }
              : set,
          ),
        })),
      };
    });
    markDirty();
  };

  const onDeleteSetDraft = (setId: string) => {
    setDraftSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.map((exercise) => ({
          ...exercise,
          sets: exercise.sets
            .filter((set) => set.id !== setId)
            .map((set, index) => ({ ...set, orderIndex: index })),
        })),
      };
    });
    markDirty();
  };

  const onSaveAll = async () => {
    if (!workoutSession) return;
    setIsSavingAll(true);

    try {
      await updateCompletedWorkout({
        name: nameDraft,
        notes: notesDraft.trim() || null,
        completedAt: completedAtDraft,
      });

      const originalExerciseMap = new Map(
        workoutSession.exercises.map((exercise) => [exercise.id, exercise]),
      );
      const nextExerciseIds = new Set(
        draftSession.exercises
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
      for (const [index, draftExercise] of draftSession.exercises.entries()) {
        if (!isTempId(draftExercise.id) && originalExerciseMap.has(draftExercise.id)) {
          resolvedExerciseIds.set(draftExercise.id, draftExercise.id);
          continue;
        }

        const session = await addExerciseToWorkout({
          exerciseId: draftExercise.exerciseId,
        });
        const created = session.exercises.find((exercise) => {
          return (
            exercise.exerciseId === draftExercise.exerciseId &&
            !knownExerciseIds.has(exercise.id)
          );
        });
        if (!created) continue;
        knownExerciseIds.add(created.id);
        resolvedExerciseIds.set(draftExercise.id, created.id);

        if (created.orderIndex !== index) {
          // Order stabilizes through insert/remove actions; keep draft order in-memory.
        }
      }

      for (const draftExercise of draftSession.exercises) {
        const realExerciseId =
          resolvedExerciseIds.get(draftExercise.id) ?? draftExercise.id;
        const originalExercise = originalExerciseMap.get(realExerciseId);
        const originalSetMap = new Map(
          (originalExercise?.sets ?? []).map((set) => [set.id, set]),
        );

        const nextSetIds = new Set(
          draftExercise.sets
            .filter((set) => !isTempId(set.id))
            .map((set) => set.id),
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

          if (
            !areSetsEqual(originalSet, draftSet)
          ) {
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
      setHasUnsavedChanges(false);
      setShowExitModal(false);

      if (pendingNavigationActionRef.current) {
        navigation.dispatch(pendingNavigationActionRef.current);
        pendingNavigationActionRef.current = null;
      }
    } finally {
      setIsSavingAll(false);
    }
  };

  const onDiscardChangesAndLeave = () => {
    setShowExitModal(false);
    setHasUnsavedChanges(false);
    if (pendingNavigationActionRef.current) {
      navigation.dispatch(pendingNavigationActionRef.current);
      pendingNavigationActionRef.current = null;
    }
  };

  return (
    <CustomScreen scroll contentContainerStyle={styles.container}>
      <CustomText variant="title">Workout Detail</CustomText>

      <CustomCard style={styles.card}>
        <CustomText muted>Name</CustomText>
        <TextInput
          value={nameDraft}
          onChangeText={(value) => {
            setNameDraft(value);
            markDirty();
          }}
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

        <CustomText muted>Notes</CustomText>
        <TextInput
          value={notesDraft}
          onChangeText={(value) => {
            setNotesDraft(value);
            markDirty();
          }}
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
      </CustomCard>

      <CustomCard style={styles.card}>
        <CustomText>{`Completed ${completedAtDate ? format(completedAtDate, "PPP p") : "N/A"}`}</CustomText>
        <CustomText
          muted
        >{`Duration ${draftSession.durationSeconds ?? 0}s`}</CustomText>
        <Pressable onPress={() => setShowCompletedAtPicker(true)}>
          <CustomText muted>Edit completed date/time</CustomText>
        </Pressable>
        {showCompletedAtPicker && completedAtDate ? (
          <DateTimePicker
            mode="date"
            value={completedAtDate}
            onChange={onChangeCompletedAt}
          />
        ) : null}
      </CustomCard>

      <View style={styles.exerciseList}>
        <View style={styles.exerciseListHeader}>
          <CustomText>Exercises</CustomText>
          <Pressable onPress={() => setShowAddExerciseSheet(true)}>
            <CustomText muted>Add Saved Exercise</CustomText>
          </Pressable>
        </View>
        {draftSession.exercises.map((exercise) => (
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

      <CustomButton
        label="Save All"
        loading={isSaving || isSavingAll}
        onPress={() => void onSaveAll()}
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
            <CustomText muted>
              Save changes before leaving this workout?
            </CustomText>
            <View style={styles.modalActions}>
              <CustomButton
                label="Save"
                loading={isSavingAll}
                onPress={() => void onSaveAll()}
              />
              <CustomButton label="Discard" onPress={onDiscardChangesAndLeave} />
              <CustomButton
                label="Cancel"
                onPress={() => setShowExitModal(false)}
              />
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
