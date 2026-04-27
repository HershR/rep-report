import { Pressable, StyleSheet, View } from "react-native";

import { CustomCard, CustomText } from "@/components/common";
import { TemplateSetRow } from "@/features/templates/components/TemplateSetRow";
import { isCardioExercise } from "@/features/workouts/utils/isCardioExercise";
import { spacing } from "@/theme";

type EditableSet = {
  localId: string;
  repsText: string;
  weightText: string;
  durationText: string;
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
    field: "repsText" | "weightText" | "durationText",
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
    <CustomCard style={styles.card}>
      <View style={styles.header}>
        <CustomText>{exerciseName}</CustomText>
        <Pressable onPress={onDeleteExercise}>
          <CustomText muted>Remove</CustomText>
        </Pressable>
      </View>

      {sets.map((set, index) => (
        <TemplateSetRow
          key={set.localId}
          index={index}
          repsText={set.repsText}
          weightText={set.weightText}
          durationText={set.durationText}
          showDuration={showDuration}
          onDelete={() => onDeleteSet(set.localId)}
          onChangeReps={(value) => onUpdateSet(set.localId, "repsText", value)}
          onChangeWeight={(value) => onUpdateSet(set.localId, "weightText", value)}
          onChangeDuration={(value) => onUpdateSet(set.localId, "durationText", value)}
        />
      ))}

      <Pressable onPress={onAddSet} style={styles.addSetButton}>
        <CustomText muted>Add Target Set</CustomText>
      </Pressable>
    </CustomCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addSetButton: {
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});
