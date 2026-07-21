import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Check, Trophy } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { useColorScheme } from "nativewind";
import { View } from "react-native";
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
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import { checkSetPersonalRecord } from "@/features/personal-records/prDetection";
import type { SetPrResult } from "@/features/personal-records/types";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { AddSavedExerciseSheet } from "@/features/templates/components/AddSavedExerciseSheet";
import { WorkoutExerciseBlock } from "@/features/workouts/components/WorkoutExerciseBlock";
import { WorkoutTimerHeader } from "@/features/workouts/components/WorkoutTimerHeader";
import { useActiveWorkout } from "@/features/workouts/hooks/useActiveWorkout";
import type { WorkoutSetInput } from "@/features/workouts/types";
import { THEME } from "@/lib/theme";
import { weightToText } from "@/lib/units";

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
  }>();
  const { colorScheme: scheme } = useColorScheme();
  const colors = THEME[scheme ?? "light"];
  const { appSettings } = useAppSettings();
  const weightUnit = appSettings?.weightUnit ?? "lb";
  const [showAddExerciseSheet, setShowAddExerciseSheet] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [incompleteSetsDialogOpen, setIncompleteSetsDialogOpen] =
    useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [noExerciseAlertOpen, setNoExerciseAlertOpen] = useState(false);
  const { favorites } = useFavoriteExercises();
  const {
    activeWorkout,
    isLoading,
    startWorkout,
    resumeWorkout,
    completeWorkout,
    cancelWorkout,
    addExerciseToWorkout,
    addSetToWorkout,
    removeExerciseFromWorkout,
    updateSet,
    deleteSet,
    removeIncompleteSets,
  } = useActiveWorkout();

  useEffect(() => {
    if (activeWorkout?.status === "active") return;
    if (params.sessionId) {
      void resumeWorkout(params.sessionId);
      return;
    }
    void startWorkout({
      name: params.name ?? "Workout",
      templateId: params.templateId ?? null,
    });
  }, [
    activeWorkout?.id,
    activeWorkout?.status,
    params.name,
    params.sessionId,
    params.templateId,
    resumeWorkout,
    startWorkout,
  ]);

  useEffect(() => {
    if (!activeWorkout?.startedAt) return;
    const tick = () => {
      setElapsedSeconds(
        Math.max(
          0,
          Math.floor((Date.now() - Date.parse(activeWorkout.startedAt)) / 1000),
        ),
      );
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [activeWorkout?.startedAt]);

  const canComplete = useMemo(
    () => Boolean(activeWorkout && activeWorkout.exercises.length > 0),
    [activeWorkout],
  );

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

  if (isLoading || !activeWorkout) {
    return (
      <CustomScreen>
        <Text variant="muted">Loading workout...</Text>
      </CustomScreen>
    );
  }

  const finishAndCelebrate = async (finish: () => Promise<unknown>) => {
    await finish();
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toast.success("Nice work!", {
      icon: <Icon as={Check} size={18} color={colors.chart3} />,
      duration: 2500,
    });
    router.replace("/(tabs)/home");
  };

  const onComplete = async () => {
    await flushPendingSetUpdates();

    if (!canComplete) {
      setNoExerciseAlertOpen(true);
      return;
    }

    const hasIncompleteSets = activeWorkout.exercises.some((exercise) =>
      exercise.sets.some((set) => set.isCompleted === 0),
    );

    if (!hasIncompleteSets) {
      await finishAndCelebrate(() => completeWorkout(activeWorkout.id));
      return;
    }

    setIncompleteSetsDialogOpen(true);
  };

  const onKeepAllSetsAndComplete = async () => {
    setIncompleteSetsDialogOpen(false);
    await finishAndCelebrate(() => completeWorkout(activeWorkout.id));
  };

  const onRemoveIncompleteSetsAndComplete = async () => {
    setIncompleteSetsDialogOpen(false);
    await finishAndCelebrate(async () => {
      await removeIncompleteSets(activeWorkout.id);
      await completeWorkout(activeWorkout.id);
    });
  };

  const onCancel = async () => {
    cancelPendingSetUpdates();
    await cancelWorkout(activeWorkout.id);
    router.replace("/(tabs)/home");
  };

  return (
    <CustomScreen scroll contentContainerStyle={{ gap: 16, paddingBottom: 32 }}>
      <WorkoutTimerHeader
        workoutName={activeWorkout.name}
        elapsedSeconds={elapsedSeconds}
      />

      <View className="gap-2">
        <Button onPress={() => void onComplete()}>
          <Text>Complete Workout</Text>
        </Button>
        <Button variant="ghost" onPress={() => setCancelConfirmOpen(true)}>
          <Text>Cancel Workout</Text>
        </Button>
      </View>

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

      {activeWorkout.exercises.length === 0 ? (
        <Text variant="muted">No exercises yet.</Text>
      ) : null}

      <View className="gap-3">
        {activeWorkout.exercises.map((workoutExercise, index) => (
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
                  workoutSessionId: activeWorkout.id,
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
            />
          </View>
        ))}
      </View>

      <AddSavedExerciseSheet
        visible={showAddExerciseSheet}
        favorites={favorites}
        onClose={() => setShowAddExerciseSheet(false)}
        onAddExercise={(exercise) => {
          setShowAddExerciseSheet(false);
          void addExerciseToWorkout({
            workoutSessionId: activeWorkout.id,
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

      <AlertDialog
        open={incompleteSetsDialogOpen}
        onOpenChange={setIncompleteSetsDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Incomplete sets</AlertDialogTitle>
            <AlertDialogDescription>
              Some sets in this workout haven&apos;t been marked complete. What
              would you like to do?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onPress={() => setIncompleteSetsDialogOpen(false)}
            >
              <Text>Cancel</Text>
            </Button>
            <Button
              variant="destructive"
              onPress={() => void onRemoveIncompleteSetsAndComplete()}
            >
              <Text>Remove incomplete sets</Text>
            </Button>
            <Button onPress={() => void onKeepAllSetsAndComplete()}>
              <Text>Keep all sets</Text>
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
          void onCancel();
        }}
      />
    </CustomScreen>
  );
}
