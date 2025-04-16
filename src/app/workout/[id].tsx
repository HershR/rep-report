import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import React from "react";
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
enum FormMode {
  Create = 0,
  Update = 1,
}

const WorkoutDetails = () => {
  const {
    id,
    exerciseId,
    exerciseName,
  }: {
    id: string;
    exerciseId: string;
    exerciseName: string;
    exerciseURI: string;
  } = useLocalSearchParams(); //workout id if updating
  const formMode: FormMode =
    parseInt(id) < 0 ? FormMode.Create : FormMode.Update;
  const db = useSQLiteContext();
  db.execSync("PRAGMA foreign_keys = ON");
  const drizzleDb = drizzle(db, { schema });

  const { selectedDate } = useDate();

  const { data: originalWorkout, loading } = useFetch(() =>
    formMode === FormMode.Update
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
    if (formMode === FormMode.Create) {
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
        await updateWorkoutWithSets(
          drizzleDb,
          originalWorkout!.id,
          workoutForm
        );
        saveSuccessMsg();
      } catch (error: any) {
        saveFailMsg(error);
      }
    }
  }

  async function workoutDelete() {
    if (formMode === FormMode.Update && !!originalWorkout) {
      await deleteWorkout(drizzleDb, originalWorkout.id);
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
    <View className="flex-1 bg-secondary">
      <SafeAreaView className="flex-1 mx-8 my-10">
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
          {formMode === FormMode.Update && loading ? (
            <ActivityIndicator></ActivityIndicator>
          ) : (
            <WorkoutForm
              defaultForm={
                formMode === FormMode.Update && !!originalWorkout
                  ? originalWorkout
                  : {
                      date:
                        selectedDate?.toISODate() ?? new Date().toISOString(),
                      mode: 0,
                      notes: null,
                      exercise: { name: exerciseName, image: null },
                      sets: [emptySet, emptySet],
                    }
              }
              onSubmit={saveWorkout}
              onDelete={workoutDelete}
              formMode={formMode}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default WorkoutDetails;
