import { KeyboardAvoidingView, Platform } from "react-native";
import React from "react";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useDate } from "@/src/context/DateContext";
import * as schema from "@/src/db/schema";
import {
  deleteWorkout,
  getWorkoutById,
  updateWorkoutWithSets,
} from "@/src/db/dbHelpers";
import { router, useLocalSearchParams } from "expo-router";
import useFetch from "@/src/services/useFetch";

import { Button } from "@/src/components/ui/button";
import { ArrowRight } from "@/src/lib/icons/ArrowRight";
import WorkoutForm from "@/src/components/WorkoutForm";
import Toast from "react-native-toast-message";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import ConfirmAlert from "@/src/components/ConfirmAlert";
import { Trash2 } from "@/src/lib/icons/Trash2";
import ActivityLoader from "@/src/components/ActivityLoader";
import { expo_sqlite } from "@/src/db/client";

const UpdateWorkout = () => {
  const {
    id: workoutId,
    exerciseId,
    exerciseName,
  }: {
    id: string;
    exerciseId: string;
    exerciseName: string;
  } = useLocalSearchParams();

  const { selectedDate } = useDate();

  // expo_sqlite.execSync("PRAGMA foreign_keys = ON");
  const { data: workout, loading } = useFetch(() =>
    getWorkoutById(parseInt(workoutId))
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
    try {
      await updateWorkoutWithSets(workout!.id, workoutForm);
      saveSuccessMsg();
    } catch (error: any) {
      saveFailMsg(error);
    }
  }
  async function workoutDelete() {
    await deleteWorkout(parseInt(workoutId));
    router.back();
  }

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
          <ActivityLoader />
        ) : (
          <>
            <WorkoutForm
              defaultForm={{
                date: selectedDate?.toISODate()!,
                mode: 0,
                notes: null,
                exercise: { name: exerciseName, image: null },
                sets: workout?.sets || [],
                unit: "lb",
              }}
              onSubmit={saveWorkout}
              action={() => (
                <ConfirmAlert
                  title={"Delete Workout"}
                  description={"This action can not be undone"}
                  trigger={<Trash2 className="color-destructive" />}
                  onConfirm={workoutDelete}
                  onCancel={() => {}}
                />
              )}
            />
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

export default UpdateWorkout;
