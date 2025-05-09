import { KeyboardAvoidingView, Platform } from "react-native";
import React from "react";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import { Button } from "@/src/components/ui/button";
import { ArrowRight } from "@/src/lib/icons/ArrowRight";
import { router, useLocalSearchParams } from "expo-router";
import RoutineForm, { RoutineFormField } from "@/src/components/RoutineForm";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/src/db/schema";
import Toast from "react-native-toast-message";
import { getRoutineById, updateRoutineWithExercises } from "@/src/db/dbHelpers";
import useFetch from "@/src/services/useFetch";
import ActivityLoader from "@/src/components/ActivityLoader";
const ViewUpateRoutine = () => {
  const {
    id: routineId,
  }: {
    id: string;
  } = useLocalSearchParams();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  db.execSync("PRAGMA foreign_keys = ON");

  const { data: routine, loading } = useFetch(() =>
    getRoutineById(drizzleDb, parseInt(routineId))
  );

  function saveSuccessMsg() {
    Toast.show({
      type: "success",
      text1: "Routine Created",
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
  async function saveRoutine(routineForm: RoutineFormField) {
    try {
      updateRoutineWithExercises(drizzleDb, parseInt(routineId), routineForm);
    } catch (error: any) {
      saveFailMsg(error);
      return;
    }
    saveSuccessMsg();
    // router.push("/");
  }
  return (
    <SafeAreaWrapper>
      <Button
        variant={"ghost"}
        size={"icon"}
        onPress={() => router.back()}
        className="z-50"
      >
        <ArrowRight size={32} className="rotate-180 color-primary mb-4" />
      </Button>
      {loading ? (
        <ActivityLoader />
      ) : (
        <KeyboardAvoidingView
          className="relative flex-1 justify-start items-center"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <RoutineForm
            defaultForm={{
              name: routine?.name || "",
              description: routine?.description || "",
              exercises:
                routine?.routineExercises.map((x) => {
                  return {
                    id: x.exercise.id,
                    name: x.exercise.name || "",
                    category: x.exercise.category || "",
                    image: x.exercise.image || "",
                  };
                }) || [],
            }}
            onSubmit={saveRoutine}
          />
        </KeyboardAvoidingView>
      )}
    </SafeAreaWrapper>
  );
};

export default ViewUpateRoutine;
