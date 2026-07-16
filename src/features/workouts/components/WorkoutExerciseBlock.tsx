import { Plus, Trash2 } from "lucide-react-native";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
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
};

export function WorkoutExerciseBlock({
  workoutExercise,
  commitSetChangesOnChange = false,
  onAddSet,
  onRemoveExercise,
  onUpdateSet,
  onDeleteSet,
}: WorkoutExerciseBlockProps) {
  const showDuration = isCardioExercise(
    workoutExercise.exercise.category,
    workoutExercise.exercise.name,
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex-1">{workoutExercise.exercise.name}</CardTitle>
        <Button variant="ghost" size="icon" onPress={() => onRemoveExercise(workoutExercise.id)}>
          <Icon as={Trash2} className="text-muted-foreground size-4" />
        </Button>
      </CardHeader>

      <CardContent className="gap-2">
        {workoutExercise.sets.length === 0 ? (
          <Text variant="muted">No sets yet.</Text>
        ) : (
          workoutExercise.sets.map((workoutSet, index) => (
            <WorkoutSetRow
              key={workoutSet.id}
              index={index}
              workoutSet={workoutSet}
              isCardio={showDuration}
              commitOnChange={commitSetChangesOnChange}
              onUpdate={onUpdateSet}
              onDelete={onDeleteSet}
            />
          ))
        )}

        <Button variant="outline" size="sm" className="self-start" onPress={() => onAddSet(workoutExercise.id)}>
          <Icon as={Plus} className="text-foreground size-4" />
          <Text>Add Set</Text>
        </Button>
      </CardContent>
    </Card>
  );
}
