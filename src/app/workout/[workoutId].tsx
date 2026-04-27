import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";

import {
  CustomButton,
  CustomCard,
  CustomScreen,
  CustomText,
} from "@/components/common";
import { WorkoutSetRow } from "@/features/workouts/components/WorkoutSetRow";
import { useWorkoutSession } from "@/features/workouts/hooks/useWorkoutSession";
import { isCardioExercise } from "@/features/workouts/utils/isCardioExercise";
import { spacing, useThemeColors } from "@/theme";

export default function WorkoutDetailScreen() {
  const params = useLocalSearchParams<{ workoutId: string }>();
  const colors = useThemeColors();
  const {
    workoutSession,
    isLoading,
    updateSet,
    deleteSet,
    updateCompletedWorkout,
  } = useWorkoutSession(params.workoutId);
  const [nameDraft, setNameDraft] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const [showCompletedAtPicker, setShowCompletedAtPicker] = useState(false);

  const completedAtDate = useMemo(() => {
    if (!workoutSession?.completedAt) return null;
    return new Date(workoutSession.completedAt);
  }, [workoutSession?.completedAt]);

  useEffect(() => {
    if (!workoutSession) return;
    setNameDraft(workoutSession.name);
    setNotesDraft(workoutSession.notes ?? "");
  }, [workoutSession]);

  if (isLoading || !workoutSession) {
    return (
      <CustomScreen>
        <CustomText muted>Loading workout...</CustomText>
      </CustomScreen>
    );
  }

  const onSaveBasics = async () => {
    await updateCompletedWorkout({
      name: nameDraft,
      notes: notesDraft.trim() || null,
    });
  };

  const onChangeCompletedAt = async (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (event.type === "dismissed") {
      setShowCompletedAtPicker(false);
      return;
    }
    if (!selectedDate) return;
    setShowCompletedAtPicker(false);
    await updateCompletedWorkout({
      completedAt: selectedDate.toISOString(),
    });
  };

  return (
    <CustomScreen scroll contentContainerStyle={styles.container}>
      <CustomText variant="title">Workout Detail</CustomText>

      <CustomCard style={styles.card}>
        <CustomText muted>Name</CustomText>
        <TextInput
          value={nameDraft}
          onChangeText={setNameDraft}
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
          onChangeText={setNotesDraft}
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

        <CustomButton label="Save Basics" onPress={() => void onSaveBasics()} />
      </CustomCard>

      <CustomCard style={styles.card}>
        <CustomText>{`Completed ${completedAtDate ? format(completedAtDate, "PPP p") : "N/A"}`}</CustomText>
        <CustomText
          muted
        >{`Duration ${workoutSession.durationSeconds ?? 0}s`}</CustomText>
        <Pressable onPress={() => setShowCompletedAtPicker(true)}>
          <CustomText muted>Edit completed date/time</CustomText>
        </Pressable>
        {showCompletedAtPicker && completedAtDate ? (
          <DateTimePicker
            mode="date"
            value={completedAtDate}
            onChange={(event, date) => {
              void onChangeCompletedAt(event, date);
            }}
          />
        ) : null}
      </CustomCard>

      <View style={styles.exerciseList}>
        {workoutSession.exercises.map((exercise) => (
          <CustomCard key={exercise.id} style={styles.card}>
            <CustomText>{exercise.exercise.name}</CustomText>
            {exercise.sets.length === 0 ? (
              <CustomText muted>No sets.</CustomText>
            ) : null}
            {exercise.sets.map((set, index) => (
              <WorkoutSetRow
                key={set.id}
                index={index}
                workoutSet={set}
                isCardio={isCardioExercise(exercise.exercise.category, exercise.exercise.name)}
                onUpdate={(setId, input) => {
                  void updateSet({ setId, ...input });
                }}
                onDelete={(setId) => {
                  void deleteSet(setId);
                }}
              />
            ))}
          </CustomCard>
        ))}
      </View>
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
});
