import { Pressable, StyleSheet, View } from "react-native";

import { CustomCard, CustomText } from "@/components/common";
import { WorkoutSetRow } from "@/features/workouts/components/WorkoutSetRow";
import { isCardioExercise } from "@/features/workouts/utils/isCardioExercise";
import type { WorkoutSessionExerciseWithDetails } from "@/features/workouts/types";
import { spacing } from "@/theme";

type WorkoutExerciseBlockProps = {
  workoutExercise: WorkoutSessionExerciseWithDetails;
  onAddSet: (workoutSessionExerciseId: string) => void;
  onRemoveExercise: (workoutSessionExerciseId: string) => void;
  onUpdateSet: (
    setId: string,
    input: {
      reps?: number | null;
      weight?: number | null;
      durationSeconds?: number | null;
      isCompleted?: boolean;
    },
  ) => void;
  onDeleteSet: (setId: string) => void;
};

export function WorkoutExerciseBlock({
  workoutExercise,
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
    <CustomCard style={styles.card}>
      <View style={styles.header}>
        <CustomText>{workoutExercise.exercise.name}</CustomText>
        <View style={styles.headerActions}>
          <Pressable onPress={() => onAddSet(workoutExercise.id)}>
            <CustomText muted>Add Set</CustomText>
          </Pressable>
          <Pressable onPress={() => onRemoveExercise(workoutExercise.id)}>
            <CustomText muted>Remove</CustomText>
          </Pressable>
        </View>
      </View>

      {workoutExercise.sets.length === 0 ? (
        <CustomText muted>No sets yet.</CustomText>
      ) : (
        <View style={styles.sets}>
          {workoutExercise.sets.map((workoutSet, index) => (
            <WorkoutSetRow
              key={workoutSet.id}
              index={index}
              workoutSet={workoutSet}
              showDuration={showDuration}
              onUpdate={onUpdateSet}
              onDelete={onDeleteSet}
            />
          ))}
        </View>
      )}
    </CustomCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sets: {
    gap: spacing.xs,
  },
});
