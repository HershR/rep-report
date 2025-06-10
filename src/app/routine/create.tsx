import React from "react";
import { router } from "expo-router";
import { KeyboardAvoidingView, Platform } from "react-native";
import Toast from "react-native-toast-message";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import RoutineForm, { RoutineFormField } from "@/src/components/RoutineForm";
//db
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/src/db/schema";
import {
  addDaysToRoutine,
  addExercisesToRoutine,
  createRoutine,
} from "@/src/db/dbHelpers";

const ViewRoutine = () => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  db.execSync("PRAGMA foreign_keys = ON");

  function saveSuccessMsg() {
    Toast.show({
      type: "success",
      text1: "Routine Created",
      visibilityTime: 1000,
    });
  }
  function saveFailMsg(error: Error) {
    console.log("Create Routine Error: ", error);
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to Save Workout, reason: " + error,
    });
  }

  async function saveRoutine(routineForm: RoutineFormField) {
    try {
      const routineId = await createRoutine(drizzleDb, {
        name: routineForm.name,
        description: routineForm.description || null,
      });
      await addExercisesToRoutine(drizzleDb, routineId, routineForm.exercises);
      await addDaysToRoutine(
        drizzleDb,
        routineId,
        routineForm.days.filter((x) => x.selected).map((y) => y.id)
      );
    } catch (error: any) {
      saveFailMsg(error);
      return;
    }
    saveSuccessMsg();
    setTimeout(() => {
      router.dismissTo("/saved");
    }, 300);
  }
  return (
    <SafeAreaWrapper hasHeader>
      <KeyboardAvoidingView
        className="relative flex-1 justify-start items-center"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <RoutineForm onSubmit={saveRoutine} />
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

export default ViewRoutine;
