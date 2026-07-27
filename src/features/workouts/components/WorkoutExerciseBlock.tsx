import { useRouter } from "expo-router";
import { Check, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { WorkoutSetRow } from "@/features/workouts/components/WorkoutSetRow";
import { isCardioExercise } from "@/features/workouts/utils/isCardioExercise";
import type { WorkoutSessionExerciseWithDetails } from "@/features/workouts/types";

type WorkoutExerciseBlockProps = {
  workoutExercise: WorkoutSessionExerciseWithDetails;
  commitSetChangesOnChange?: boolean;
  onAddSet: (workoutSessionExerciseId: string) => void;
  onRemoveExercise: (workoutSessionExerciseId: string) => void;
  onUpdateSet: (
    setId: string,
    input: {
      reps?: number | null;
      weight?: number | null;
      durationSeconds?: number | null;
      distance?: number | null;
      isCompleted?: boolean;
    },
  ) => void;
  onDeleteSet: (setId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
};

export function WorkoutExerciseBlock({
  workoutExercise,
  commitSetChangesOnChange = false,
  onAddSet,
  onRemoveExercise,
  onUpdateSet,
  onDeleteSet,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
}: WorkoutExerciseBlockProps) {
  const router = useRouter();
  const { appSettings } = useAppSettings();
  const distanceUnit = appSettings?.distanceUnit ?? "mi";
  const weightUnit = appSettings?.weightUnit ?? "lb";
  const showDuration = isCardioExercise(
    workoutExercise.exercise.category,
    workoutExercise.exercise.name,
  );

  const firstColumnLabel = showDuration ? "TIME" : "REPS";
  const secondColumnLabel = showDuration
    ? `DIST (${distanceUnit.toUpperCase()})`
    : `WEIGHT (${weightUnit.toUpperCase()})`;

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Pressable
          className="flex-1 active:opacity-70"
          onPress={() =>
            router.push({
              pathname: "/exercise/[exerciseId]",
              params: {
                exerciseId: workoutExercise.exerciseId,
                source: "local",
              },
            })
          }
        >
          <Text className="text-primary font-semibold">
            {workoutExercise.exercise.name}
          </Text>
        </Pressable>
        <View className="flex-row items-center">
          {onMoveUp ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={!canMoveUp}
              onPress={onMoveUp}
            >
              <Icon as={ChevronUp} className="text-muted-foreground size-4" />
            </Button>
          ) : null}
          {onMoveDown ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={!canMoveDown}
              onPress={onMoveDown}
            >
              <Icon as={ChevronDown} className="text-muted-foreground size-4" />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onPress={() => onRemoveExercise(workoutExercise.id)}
          >
            <Icon as={Trash2} className="text-muted-foreground size-4" />
          </Button>
        </View>
      </View>

      {workoutExercise.sets.length === 0 ? (
        <Text variant="muted">No sets yet.</Text>
      ) : (
        <>
          <View className="flex-row items-center gap-2 px-2">
            <View className="w-6" />
            <Text variant="muted" className="flex-1 text-center text-xs">
              {firstColumnLabel}
            </Text>
            <Text variant="muted" className="flex-1 text-center text-xs">
              {secondColumnLabel}
            </Text>
            <View className="w-9 items-center">
              <Icon as={Check} className="text-muted-foreground size-3.5" />
            </View>
            <View className="w-8" />
          </View>
          <Separator />
          {workoutExercise.sets.map((workoutSet, index) => (
            <WorkoutSetRow
              key={workoutSet.id}
              index={index}
              workoutSet={workoutSet}
              isCardio={showDuration}
              commitOnChange={commitSetChangesOnChange}
              onUpdate={onUpdateSet}
              onDelete={onDeleteSet}
            />
          ))}
        </>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 self-start"
        onPress={() => onAddSet(workoutExercise.id)}
      >
        <Icon as={Plus} className="text-primary size-4" />
        <Text className="text-primary">Add set</Text>
      </Button>
    </View>
  );
}
