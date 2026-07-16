import { Plus, Trash2 } from "lucide-react-native";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
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
};

export function TemplateExerciseBlock({
  exerciseName,
  exerciseCategory,
  sets,
  onAddSet,
  onDeleteExercise,
  onDeleteSet,
  onUpdateSet,
}: TemplateExerciseBlockProps) {
  const showDuration = isCardioExercise(exerciseCategory, exerciseName);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex-1">{exerciseName}</CardTitle>
        <Button variant="ghost" size="icon" onPress={onDeleteExercise}>
          <Icon as={Trash2} className="text-muted-foreground size-4" />
        </Button>
      </CardHeader>

      <CardContent className="gap-2">
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
            onChangeWeight={(value) => onUpdateSet(set.localId, "weightText", value)}
            onChangeDuration={(value) => onUpdateSet(set.localId, "durationText", value)}
            onChangeDistance={(value) => onUpdateSet(set.localId, "distanceText", value)}
          />
        ))}

        <Button variant="outline" size="sm" className="self-start" onPress={onAddSet}>
          <Icon as={Plus} className="text-foreground size-4" />
          <Text>Add Target Set</Text>
        </Button>
      </CardContent>
    </Card>
  );
}
