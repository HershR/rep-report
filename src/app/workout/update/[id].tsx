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
import { convertWeight } from "@/src/utils/measurementConversion";
import { useMeasurementUnit } from "@/src/context/MeasurementUnitContext";

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
  const { unit } = useMeasurementUnit();

  const { selectedDate } = useDate();

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  db.execSync("PRAGMA foreign_keys = ON");
  const { data: workout, loading } = useFetch(() =>
    getWorkoutById(drizzleDb, parseInt(workoutId))
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
      await updateWorkoutWithSets(drizzleDb, workout!.id, workoutForm);
      saveSuccessMsg();
    } catch (error: any) {
      saveFailMsg(error);
    }
  }
  async function workoutDelete() {
    await deleteWorkout(drizzleDb, parseInt(workoutId));
    router.back();
  }

  return (
    <SafeAreaWrapper hasHeader>
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
                date: workout?.date || selectedDate?.toISODate()!,
                mode: workout?.mode || 0,
                notes: workout?.notes || "",
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
