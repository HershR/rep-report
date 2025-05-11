import { KeyboardAvoidingView, Platform } from "react-native";
import React from "react";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import { Button } from "@/src/components/ui/button";
import { ArrowRight } from "@/src/lib/icons/ArrowRight";
import { router } from "expo-router";
import RoutineForm, { RoutineFormField } from "@/src/components/RoutineForm";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/src/db/schema";
import Toast from "react-native-toast-message";
import {
  addDaysToRoutine,
  addExercisesToRoutine,
  createRoutine,
} from "@/src/db/dbHelpers";
import { db, expo_sqlite } from "@/src/db/client";

const ViewRoutine = () => {
  expo_sqlite.execSync("PRAGMA foreign_keys = ON");
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
      console.log(routineForm);
      const routineId = await createRoutine({
        name: routineForm.name,
        description: routineForm.description || null,
      });
      addExercisesToRoutine(routineId, routineForm.exercises);
      addDaysToRoutine(
        routineId,
        routineForm.days.filter((day) => day.selected).map((x) => x.id)
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
    <SafeAreaWrapper>
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
        <RoutineForm onSubmit={saveRoutine} />
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

export default ViewRoutine;
