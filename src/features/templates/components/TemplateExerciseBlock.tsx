import { useRouter } from "expo-router";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { TemplateSetRow } from "@/features/templates/components/TemplateSetRow";
import { isCardioExercise } from "@/features/workouts/utils/isCardioExercise";

type EditableSet = {
  localId: string;
  repsText: string;
  weightText: string;
  durationText: string;
  distanceText: string;
};

type TemplateExerciseBlockProps = {
  exerciseId: string;
  exerciseName: string;
  exerciseCategory: string | null;
  sets: EditableSet[];
  onAddSet: () => void;
  onDeleteExercise: () => void;
  onDeleteSet: (setLocalId: string) => void;
  onUpdateSet: (
    setLocalId: string,
    field: "repsText" | "weightText" | "durationText" | "distanceText",
    value: string,
  ) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
};

export function TemplateExerciseBlock({
  exerciseId,
  exerciseName,
  exerciseCategory,
  sets,
  onAddSet,
  onDeleteExercise,
  onDeleteSet,
  onUpdateSet,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
}: TemplateExerciseBlockProps) {
  const router = useRouter();
  const { appSettings } = useAppSettings();
  const distanceUnit = appSettings?.distanceUnit ?? "mi";
  const weightUnit = appSettings?.weightUnit ?? "lb";
  const showDuration = isCardioExercise(exerciseCategory, exerciseName);

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
              params: { exerciseId, source: "local" },
            })
          }
        >
          <Text className="text-primary font-semibold">{exerciseName}</Text>
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
            onPress={onDeleteExercise}
          >
            <Icon as={Trash2} className="text-muted-foreground size-4" />
          </Button>
        </View>
      </View>

      {sets.length > 0 ? (
        <>
          <View className="flex-row items-center gap-2">
            <View className="w-6" />
            <Text variant="muted" className="flex-1 text-center text-xs">
              {firstColumnLabel}
            </Text>
            <Text variant="muted" className="flex-1 text-center text-xs">
              {secondColumnLabel}
            </Text>
            <View className="w-8" />
          </View>
          <Separator />
        </>
      ) : null}

      {sets.map((set, index) => (
        <TemplateSetRow
          key={set.localId}
          index={index}
          repsText={set.repsText}
          weightText={set.weightText}
          durationText={set.durationText}
          distanceText={set.distanceText}
          isCardio={showDuration}
          onDelete={() => onDeleteSet(set.localId)}
          onChangeReps={(value) => onUpdateSet(set.localId, "repsText", value)}
          onChangeWeight={(value) =>
            onUpdateSet(set.localId, "weightText", value)
          }
          onChangeDuration={(value) =>
            onUpdateSet(set.localId, "durationText", value)
          }
          onChangeDistance={(value) =>
            onUpdateSet(set.localId, "distanceText", value)
          }
        />
      ))}

      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 self-start"
        onPress={onAddSet}
      >
        <Icon as={Plus} className="text-primary size-4" />
        <Text className="text-primary">Add set</Text>
      </Button>
    </View>
  );
}
