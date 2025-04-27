import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useDate } from "@/src/context/DateContext";
import * as schema from "@/src/db/schema";
import {
  getWorkoutById,
  getRecentWorkout,
  createWorkoutWithExercise,
  updateWorkoutWithSets,
  addSetsToWorkout,
  deleteWorkout,
} from "@/src/db/dbHelpers";
import { router, useLocalSearchParams } from "expo-router";
import useFetch from "@/src/services/useFetch";

import { Button } from "@/src/components/ui/button";
import { ArrowRight } from "@/src/lib/icons/ArrowRight";
import WorkoutForm from "@/src/components/WorkoutForm";
import Toast from "react-native-toast-message";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";

enum FormMode {
  Create = 0,
  Update = 1,
}

const WorkoutDetails = () => {
  const {
    id,
    exerciseId,
    exerciseName,
    formMode,
  }: {
    id: string;
    exerciseId: string;
    exerciseName: string;
    formMode: string;
  } = useLocalSearchParams();

  const { selectedDate } = useDate();
  const mode = parseInt(formMode) === 0 ? FormMode.Create : FormMode.Update;

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  db.execSync("PRAGMA foreign_keys = ON");
  const { data: workout, loading } = useFetch(() =>
    mode === FormMode.Update
      ? getWorkoutById(drizzleDb, parseInt(id))
      : getRecentWorkout(drizzleDb, parseInt(exerciseId))
  );
  function saveSuccessMsg() {
    Toast.show({
      type: "success",
      text1: "Workout Saved",
      visibilityTime: 2000,
    });
  }

  function saveFailMsg(error: Error) {
    console.log(error);
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to Save Workout, reason: " + error,
    });
  }

  async function saveWorkout(workoutForm: Workout) {
    if (mode === FormMode.Create) {
      try {
        workoutForm.exercise_id = parseInt(exerciseId);
        const workoutID = await createWorkoutWithExercise(
          drizzleDb,
          workoutForm
        );
        for (let index = 0; index < workoutForm.sets.length; index++) {
          let element = workoutForm.sets[index];
          if (workoutForm.mode === 0) {
            element = {
              ...element,
              order: index,
              duration: null,
              weight: element.weight || 0,
              reps: element.reps || 1,
            };
          } else {
            element = {
              ...element,
              order: index,
              weight: null,
              reps: null,
              duration: element.duration || "00:00:00",
            };
          }
        }
        await addSetsToWorkout(drizzleDb, workoutID, workoutForm.sets);
      } catch (error: any) {
        saveFailMsg(error);
        return;
      }
      saveSuccessMsg();
      router.push("/");
    } else {
      try {
        await updateWorkoutWithSets(drizzleDb, workout!.id, workoutForm);
        saveSuccessMsg();
      } catch (error: any) {
        saveFailMsg(error);
      }
    }
  }

  async function workoutDelete() {
    if (mode === FormMode.Update && !!workout) {
      await deleteWorkout(drizzleDb, workout.id);
      router.back();
    }
  }
  const emptySet = {
    id: -1,
    workout_id: -1,
    order: 0,
    reps: null,
    weight: null,
    duration: null,
  };
  return (
    <SafeAreaWrapper style="mt-5">
      <Button
        variant={"ghost"}
        size={"icon"}
        onPress={router.back}
        className="z-50"
      >
        <ArrowRight size={32} className="rotate-180 color-primary mb-4" />
      </Button>
      <KeyboardAvoidingView
        className="relative flex-1 justify-start items-center"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {loading ? (
          <ActivityIndicator></ActivityIndicator>
        ) : (
          <WorkoutForm
            defaultForm={
              workout || {
                date: new Date().toISOString().slice(0, 10),
                mode: 0,
                notes: null,
                exercise: { name: exerciseName, image: null },
                sets: [emptySet, emptySet],
                unit: "lb",
              }
            }
            onSubmit={saveWorkout}
            onDelete={workoutDelete}
            formMode={mode}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

export default WorkoutDetails;
