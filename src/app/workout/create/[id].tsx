import { KeyboardAvoidingView, Platform } from "react-native";
import React, { useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useDate } from "@/src/context/DateContext";
import * as schema from "@/src/db/schema";
import {
  createWorkoutWithExercise,
  addSetsToWorkout,
  getRecentWorkout,
} from "@/src/db/dbHelpers";
import { router, useLocalSearchParams } from "expo-router";

import { Button } from "@/src/components/ui/button";
import { ArrowRight } from "@/src/lib/icons/ArrowRight";
import WorkoutForm from "@/src/components/WorkoutForm";
import Toast from "react-native-toast-message";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import useFetch from "@/src/services/useFetch";
import ActivityLoader from "@/src/components/ActivityLoader";
import { useMeasurementUnit } from "@/src/context/MeasurementUnitContext";
import { convertWeight } from "@/src/utils/measurementConversion";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SafeAreaWithHeader from "@/src/components/SafeAreaWithHeader";

const CreateWorkout = () => {
  const {
    id: workoutId,
    exerciseId,
    exerciseName,
    collectionId,
  }: {
    id: string;
    exerciseId: string;
    exerciseName: string;
    collectionId?: string;
  } = useLocalSearchParams();

  const { selectedDate } = useDate();
  const { unit } = useMeasurementUnit();

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  db.execSync("PRAGMA foreign_keys = ON");
  const { data: workout, loading } = useFetch(() =>
    getRecentWorkout(drizzleDb, parseInt(exerciseId))
  );
  function saveSuccessMsg() {
    Toast.show({
      type: "success",
      text1: "Workout Created",
      visibilityTime: 1000,
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

  async function createWorkout(workoutForm: Workout) {
    try {
      workoutForm.exercise_id = parseInt(exerciseId);
      workoutForm.routine_id = collectionId ? parseInt(collectionId) : null;
      const workoutID = await createWorkoutWithExercise(drizzleDb, workoutForm);
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
    router.back();
  }
  return (
    <SafeAreaWithHeader title="New Workout" viewStyle="my-5">
      <KeyboardAvoidingView
        className="relative flex-1 justify-start items-center"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {loading ? (
          <ActivityLoader />
        ) : (
          <WorkoutForm
            defaultForm={{
              date: selectedDate?.toISODate()!,
              mode: 0,
              notes: null,
              exercise: { name: exerciseName, image: null },
              sets:
                workout?.sets.map((x) => {
                  return {
                    ...x,
                    weight: x.weight
                      ? convertWeight(x.weight, "imperial", unit)
                      : null,
                  };
                }) || [],
            }}
            onSubmit={createWorkout}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaWithHeader>
  );
};

export default CreateWorkout;
