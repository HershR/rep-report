import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  BellRing,
  Check,
  ChevronLeft,
  MoreHorizontal,
  Trophy,
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { toast } from "sonner-native";

import { CustomScreen } from "@/components/common";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import { checkSetPersonalRecord } from "@/features/personal-records/prDetection";
import type { SetPrResult } from "@/features/personal-records/types";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { AddSavedExerciseSheet } from "@/features/templates/components/AddSavedExerciseSheet";
import { RestTimerBar } from "@/features/workouts/components/RestTimerBar";
import {
  SetEntrySheet,
  type SetEntryTarget,
} from "@/features/workouts/components/SetEntrySheet";
import { WorkoutExerciseBlock } from "@/features/workouts/components/WorkoutExerciseBlock";
import { useActiveWorkout } from "@/features/workouts/hooks/useActiveWorkout";
import {
  formatElapsed,
  useElapsedSeconds,
} from "@/features/workouts/hooks/useElapsedSeconds";
import { useRestTimer } from "@/features/workouts/hooks/useRestTimer";
import type { WorkoutSetInput } from "@/features/workouts/types";
import { THEME } from "@/lib/theme";
import {
  textToMetricWeight,
  toDisplayWeight,
  weightToText,
} from "@/lib/units";

function buildPrDescription(
  pr: SetPrResult,
  weightUnit: "lb" | "kg",
): string {
  const showWeight = pr.isWeightPr && pr.weightKg !== null;
  const weightPart = showWeight
    ? `${weightToText(pr.weightKg, weightUnit)} ${weightUnit}`
    : null;
  const repsPart =
    pr.isRepsPr && pr.reps !== null ? `${pr.reps} reps` : null;

  let stat: string;
  if (weightPart && pr.isRepsPr && pr.reps !== null) {
    stat = `${weightPart} × ${pr.reps}`;
  } else if (weightPart) {
    stat = weightPart;
  } else {
    stat = repsPart ?? "";
  }

  return `${pr.exerciseName} · ${stat}`;
}

const SET_UPDATE_DEBOUNCE_MS = 400;

type PendingSetInput = Pick<
  WorkoutSetInput,
  "reps" | "weight" | "durationSeconds" | "distance"
>;

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    templateId?: string;
    name?: string;
    sessionId?: string;
    repeatSessionId?: string;
  }>();
  const colors = THEME;
  const { appSettings } = useAppSettings();
  const weightUnit = appSettings?.weightUnit ?? "lb";
  const restTimerEnabled = (appSettings?.restTimerEnabled ?? 1) === 1;
  const restTimerDefaultSeconds = appSettings?.restTimerDefaultSeconds ?? 90;
  const rest = useRestTimer(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toast("Rest complete", {
      icon: <Icon as={BellRing} size={18} color={colors.primary} />,
      duration: 2500,
    });
  });
  const [showAddExerciseSheet, setShowAddExerciseSheet] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [noExerciseAlertOpen, setNoExerciseAlertOpen] = useState(false);
  const { favorites } = useFavoriteExercises();
  const {
    activeWorkout,
    isLoaded,
    error,
    refetch,
    startWorkout,
    resumeWorkout,
    repeatWorkout,
    renameWorkout,
    completeWorkout,
    cancelWorkout,
    addExerciseToWorkout,
    addSetToWorkout,
    removeExerciseFromWorkout,
    updateSet,
    deleteSet,
    removeIncompleteSets,
    removeEmptyExercises,
  } = useActiveWorkout();

  /**
   * Guards the bootstrap below so it decides exactly once per mount. Without it
   * the screen reads every empty cache as "no workout yet" and starts one — so
   * cancelling or finishing (both of which deliberately clear the cache) would
   * immediately spawn a phantom session, and a reload would duplicate the live
   * one before the lookup had a chance to answer.
   */
  const didBootstrapRef = useRef(false);

  useEffect(() => {
    if (didBootstrapRef.current) return;
    // Until the lookup answers, `activeWorkout` is null for "still loading" as
    // well as "nothing in progress" — acting on it here starts a duplicate.
    if (!isLoaded) return;
    didBootstrapRef.current = true;

    if (activeWorkout?.status === "active") return;
    if (params.sessionId) {
      void resumeWorkout(params.sessionId);
      return;
    }
    if (params.repeatSessionId) {
      void repeatWorkout(params.repeatSessionId);
      return;
    }
    void startWorkout({
      name: params.name ?? "Workout",
      templateId: params.templateId ?? null,
    });
  }, [
    activeWorkout?.status,
    isLoaded,
    params.name,
    params.sessionId,
    params.repeatSessionId,
    params.templateId,
    resumeWorkout,
    repeatWorkout,
    startWorkout,
  ]);

  /**
   * Ending a workout clears the active-workout cache, which would otherwise rip
   * this screen's tree — including the alert dialog still animating closed —
   * out from under itself before the dismissal lands. Keep rendering the last
   * snapshot instead: the screen is on its way out either way.
   */
  const lastWorkoutRef = useRef(activeWorkout);
  if (activeWorkout) lastWorkoutRef.current = activeWorkout;
  const workout = activeWorkout ?? lastWorkoutRef.current;

  const elapsedSeconds = useElapsedSeconds(workout?.startedAt);

  const canComplete = useMemo(
    () => Boolean(workout && workout.exercises.length > 0),
    [workout],
  );

  /**
   * Finishing and cancelling both tear the session down for good, so a second
   * trigger (a double tap, or the other dialog action) would write against an
   * already-deleted row.
   */
  const isEndingRef = useRef(false);

  const pendingSetInputsRef = useRef<Map<string, PendingSetInput>>(new Map());
  const pendingSetTimersRef = useRef<
    Map<string, ReturnType<typeof setTimeout>>
  >(new Map());
  const updateSetRef = useRef(updateSet);

  useEffect(() => {
    updateSetRef.current = updateSet;
  }, [updateSet]);

  const flushPendingSetUpdates = async () => {
    const pending = Array.from(pendingSetInputsRef.current.entries());
    pendingSetInputsRef.current.clear();
    for (const timer of pendingSetTimersRef.current.values()) {
      clearTimeout(timer);
    }
    pendingSetTimersRef.current.clear();

    await Promise.all(
      pending.map(([setId, input]) =>
        updateSetRef.current({ setId, ...input }),
      ),
    );
  };

  const cancelPendingSetUpdates = () => {
    for (const timer of pendingSetTimersRef.current.values()) {
      clearTimeout(timer);
    }
    pendingSetTimersRef.current.clear();
    pendingSetInputsRef.current.clear();
  };

  /**
   * Removes and returns any debounced-but-not-yet-committed edits for a set, so
   * a completion write can include the just-typed weight/reps in one commit
   * (otherwise the immediate completion toggle races the 400ms debounce and the
   * PR check would read a stale value).
   */
  const takePendingSetUpdate = (setId: string): PendingSetInput => {
    const pending = pendingSetInputsRef.current.get(setId) ?? {};
    pendingSetInputsRef.current.delete(setId);
    const timer = pendingSetTimersRef.current.get(setId);
    if (timer) {
      clearTimeout(timer);
      pendingSetTimersRef.current.delete(setId);
    }
    return pending;
  };

  const handleSetCompletionToggle = async (
    setId: string,
    isCompleted: boolean,
  ) => {
    const pending = takePendingSetUpdate(setId);
    const session = await updateSet({ setId, ...pending, isCompleted });
    if (!isCompleted) return;
    if (restTimerEnabled) rest.startRest(restTimerDefaultSeconds);
    const pr = await checkSetPersonalRecord(session, setId);
    if (!pr) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toast.success("New PR!", {
      icon: <Icon as={Trophy} size={18} color={colors.chart3} />,
      description: buildPrDescription(pr, weightUnit),
      duration: 3000,
    });
  };

  const scheduleSetUpdate = (setId: string, input: PendingSetInput) => {
    const merged = { ...pendingSetInputsRef.current.get(setId), ...input };
    pendingSetInputsRef.current.set(setId, merged);

    const existingTimer = pendingSetTimersRef.current.get(setId);
    if (existingTimer) clearTimeout(existingTimer);

    const timer = setTimeout(() => {
      const latest = pendingSetInputsRef.current.get(setId);
      pendingSetInputsRef.current.delete(setId);
      pendingSetTimersRef.current.delete(setId);
      if (latest) {
        void updateSetRef.current({ setId, ...latest });
      }
    }, SET_UPDATE_DEBOUNCE_MS);

    pendingSetTimersRef.current.set(setId, timer);
  };

  useEffect(() => {
    return () => {
      void flushPendingSetUpdates();
    };
  }, []);

  const [entryTarget, setEntryTarget] = useState<SetEntryTarget | null>(null);

  /** Builds the sheet's payload from whichever value the row reported. */
  const openSetEntry = (setId: string, field: "reps" | "weight") => {
    for (const exercise of workout?.exercises ?? []) {
      const index = exercise.sets.findIndex((item) => item.id === setId);
      if (index < 0) continue;
      const workoutSet = exercise.sets[index];
      const prior = index > 0 ? exercise.sets[index - 1] : null;
      setEntryTarget({
        setId,
        exerciseName: exercise.exercise.name,
        setNumber: index + 1,
        setCount: exercise.sets.length,
        field,
        reps: workoutSet.reps === null ? "" : String(workoutSet.reps),
        weight: weightToText(workoutSet.weight, weightUnit),
        previous: prior
          ? {
              reps: prior.reps === null ? "" : String(prior.reps),
              weight: weightToText(prior.weight, weightUnit),
            }
          : null,
      });
      return;
    }
  };

  const totals = useMemo(() => {
    let done = 0;
    let total = 0;
    let volumeKg = 0;
    for (const exercise of workout?.exercises ?? []) {
      for (const workoutSet of exercise.sets) {
        total += 1;
        if (workoutSet.isCompleted === 1) {
          done += 1;
          volumeKg += (workoutSet.reps ?? 0) * (workoutSet.weight ?? 0);
        }
      }
    }
    return { done, total, volumeKg };
  }, [workout]);

  if (!workout) {
    return (
      <CustomScreen>
        {error ? (
          <View className="gap-3">
            <Text variant="muted">Couldn&apos;t load this workout.</Text>
            <Button variant="outline" onPress={() => void refetch()}>
              <Text>Try again</Text>
            </Button>
          </View>
        ) : (
          <Text variant="muted">Loading workout...</Text>
        )}
      </CustomScreen>
    );
  }

  const incompleteSetCount = workout.exercises.reduce(
    (total, exercise) =>
      total + exercise.sets.filter((set) => set.isCompleted === 0).length,
    0,
  );
  const emptyExerciseCount = workout.exercises.filter(
    (exercise) => exercise.sets.length === 0,
  ).length;
  const cleanupParts: string[] = [];
  if (incompleteSetCount > 0) {
    cleanupParts.push(
      `${incompleteSetCount} unmarked set${incompleteSetCount === 1 ? "" : "s"}`,
    );
  }
  if (emptyExerciseCount > 0) {
    cleanupParts.push(
      `${emptyExerciseCount} empty exercise${emptyExerciseCount === 1 ? "" : "s"}`,
    );
  }
  const cleanupSummary =
    cleanupParts.length > 0
      ? `This workout has ${cleanupParts.join(" and ")}.`
      : "";

  /** Closes the active-workout modal, falling back to Home if it's the root. */
  const dismiss = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/home");
  };

  const commitRename = () => {
    const next = nameDraft.trim() || "Workout";
    if (next === workout.name) return;
    void renameWorkout({ sessionId: workout.id, name: next });
  };

  /** Deletes the session outright and leaves the screen. */
  const discardWorkout = async () => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;
    cancelPendingSetUpdates();
    await cancelWorkout(workout.id);
    dismiss();
  };

  const finishAndCelebrate = async (finish: () => Promise<unknown>) => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;
    await finish();
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toast.success("Nice work!", {
      icon: <Icon as={Check} size={18} color={colors.chart3} />,
      duration: 2500,
    });
    dismiss();
  };

  const onComplete = async () => {
    await flushPendingSetUpdates();

    if (!canComplete) {
      setNoExerciseAlertOpen(true);
      return;
    }

    if (incompleteSetCount === 0 && emptyExerciseCount === 0) {
      await finishAndCelebrate(() => completeWorkout(workout.id));
      return;
    }

    setCleanupDialogOpen(true);
  };

  const onKeepEverythingAndComplete = async () => {
    setCleanupDialogOpen(false);
    await finishAndCelebrate(() => completeWorkout(workout.id));
  };

  const onDiscardAndFinish = async () => {
    setCleanupDialogOpen(false);
    await removeIncompleteSets(workout.id);
    const remaining = await removeEmptyExercises(workout.id);
    if (remaining === 0) {
      // Cleanup emptied the workout — discard it rather than save an empty one.
      await discardWorkout();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      toast("Empty workout discarded", { duration: 2500 });
      return;
    }
    await finishAndCelebrate(() => completeWorkout(workout.id));
  };

  return (
    <CustomScreen
      stickyFooter={
        <>
          <RestTimerBar
            isResting={rest.isResting}
            remainingSeconds={rest.remainingSeconds}
            totalSeconds={rest.totalSeconds}
            defaultSeconds={restTimerDefaultSeconds}
            onStart={(seconds) => rest.startRest(seconds)}
            onAddTime={(delta) => rest.addTime(delta)}
            onSkip={() => rest.skipRest()}
          />
          <View className="border-border bg-surface-sunken flex-row items-center gap-5 border-t px-5 pt-3.5 pb-5">
            <View className="gap-1">
              <Text variant="microLabel">ELAPSED</Text>
              <Text variant="numeral" className="text-[17px]">
                {formatElapsed(elapsedSeconds)}
              </Text>
            </View>
            <View className="gap-1">
              <Text variant="microLabel">VOLUME</Text>
              <Text variant="numeral" className="text-[17px]">
                {Math.round(
                  toDisplayWeight(totals.volumeKg, weightUnit),
                ).toLocaleString()}
              </Text>
            </View>
            <View className="flex-1" />
            <Button onPress={() => void onComplete()}>
              <Text>Finish</Text>
            </Button>
          </View>
        </>
      }
    >
      {/* Header carries identity and position; actions live in the bottom bar. */}
      <View className="-mx-2 flex-row items-center gap-1 pb-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-11"
          accessibilityLabel="Hide workout"
          onPress={dismiss}
        >
          <Icon as={ChevronLeft} className="text-foreground" />
        </Button>
        <View className="flex-1 items-center">
          <Text variant="cardTitle" numberOfLines={1} className="text-[16px]">
            {workout.name}
          </Text>
          <Text variant="microLabel" className="mt-0.5">
            {totals.done} OF {totals.total} SETS
          </Text>
        </View>
        <Button
          variant="ghost"
          size="icon"
          className="size-11"
          accessibilityLabel="Workout options"
          onPress={() => {
            setNameDraft(workout.name);
            setShowOptions(true);
          }}
        >
          <Icon as={MoreHorizontal} className="text-foreground" />
        </Button>
      </View>

      {/* How far through the session you are, at a glance. */}
      <View className="bg-surface-raised -mx-4 h-[3px]">
        <View
          className="bg-primary h-full"
          style={{
            width: `${totals.total ? (totals.done / totals.total) * 100 : 0}%`,
          }}
        />
      </View>

      {/* Exercises are the focus — they scroll, everything else is chrome. */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {workout.exercises.length === 0 ? (
          <Text variant="muted" className="py-8 text-center">
            No exercises yet. Add one below to get started.
          </Text>
        ) : (
          workout.exercises.map((workoutExercise, index) => (
            <View key={workoutExercise.id} className="gap-3">
              {index > 0 ? <Separator /> : null}
              <WorkoutExerciseBlock
                workoutExercise={workoutExercise}
                commitSetChangesOnChange
                onAddSet={(workoutSessionExerciseId) => {
                  void addSetToWorkout({ workoutSessionExerciseId });
                }}
                onRemoveExercise={(workoutSessionExerciseId) => {
                  void removeExerciseFromWorkout({
                    workoutSessionId: workout.id,
                    workoutSessionExerciseId,
                  });
                }}
                onUpdateSet={(setId, input) => {
                  if (input.isCompleted !== undefined) {
                    void handleSetCompletionToggle(setId, input.isCompleted);
                    return;
                  }
                  scheduleSetUpdate(setId, input);
                }}
                onDeleteSet={(setId) => {
                  void deleteSet(setId);
                }}
                onEditValue={openSetEntry}
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

        <Button
          variant="ghost"
          className="mt-4"
          onPress={() => setCancelConfirmOpen(true)}
        >
          <Text className="text-destructive">Cancel Workout</Text>
        </Button>
      </ScrollView>

      <SetEntrySheet
        target={entryTarget}
        weightUnit={weightUnit}
        onClose={() => setEntryTarget(null)}
        onCommit={(setId, values) => {
          scheduleSetUpdate(setId, {
            reps: values.reps.trim() === "" ? null : Number(values.reps),
            weight: textToMetricWeight(values.weight, weightUnit),
          });
          setEntryTarget(null);
          // Same path as the row tick, so PR detection and rest still fire.
          void handleSetCompletionToggle(setId, true);
        }}
      />

      {/* Options: rename the in-progress workout. */}
      <Sheet open={showOptions} onOpenChange={setShowOptions}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Workout options</SheetTitle>
          </SheetHeader>
          <View className="gap-2">
            <Label>Name</Label>
            <Input
              value={nameDraft}
              onChangeText={setNameDraft}
              onBlur={commitRename}
              placeholder="Workout name"
            />
          </View>
        </SheetContent>
      </Sheet>

      <AddSavedExerciseSheet
        visible={showAddExerciseSheet}
        favorites={favorites}
        onClose={() => setShowAddExerciseSheet(false)}
        onAddExercise={(exercise) => {
          setShowAddExerciseSheet(false);
          void addExerciseToWorkout({
            workoutSessionId: workout.id,
            exerciseId: exercise.id,
          });
        }}
      />

      <AlertDialog
        open={noExerciseAlertOpen}
        onOpenChange={setNoExerciseAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add at least one exercise</AlertDialogTitle>
            <AlertDialogDescription>
              Workout needs one exercise before completing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onPress={() => setNoExerciseAlertOpen(false)}>
              <Text>OK</Text>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={cleanupDialogOpen} onOpenChange={setCleanupDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clean up before finishing?</AlertDialogTitle>
            <AlertDialogDescription>
              {`${cleanupSummary} Discard them, or keep everything?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onPress={() => setCleanupDialogOpen(false)}
            >
              <Text>Cancel</Text>
            </Button>
            <Button
              variant="destructive"
              onPress={() => void onDiscardAndFinish()}
            >
              <Text>Discard</Text>
            </Button>
            <Button onPress={() => void onKeepEverythingAndComplete()}>
              <Text>Keep everything</Text>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ConfirmDialog
        open={cancelConfirmOpen}
        onOpenChange={setCancelConfirmOpen}
        title="Cancel this workout?"
        description="This will discard the entire session — nothing will be saved. This can't be undone."
        confirmLabel="Cancel Workout"
        destructive
        onConfirm={() => {
          setCancelConfirmOpen(false);
          void discardWorkout();
        }}
      />
    </CustomScreen>
  );
}
