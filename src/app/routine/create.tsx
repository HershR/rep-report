import { KeyboardAvoidingView, Platform } from "react-native";
import React from "react";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import { Button } from "@/src/components/ui/button";
import { ArrowRight } from "@/src/lib/icons/ArrowRight";
import { router } from "expo-router";
import RoutineForm, { RoutineFormField } from "@/src/components/RoutineForm";
import Toast from "react-native-toast-message";
import {
  addDaysToRoutine,
  addExercisesToRoutine,
  createRoutine,
} from "@/src/db/dbHelpers";
import { expo_sqlite } from "@/src/db/client";

const ViewRoutine = () => {
  function saveSuccessMsg() {
    Toast.show({
      type: "success",
      text1: "Routine Created",
      visibilityTime: 1000,
    });
  }
  function saveFailMsg(error: Error) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to Save Workout, reason: " + error,
    });
  }
  async function saveRoutine(routineForm: RoutineFormField) {
    try {
      const routineId = await createRoutine({
        name: routineForm.name,
        description: routineForm.description || null,
      });
      await addExercisesToRoutine(routineId, routineForm.exercises);
      await addDaysToRoutine(
        routineId,
        routineForm.days.filter((day) => day.selected).map((x) => x.id)
      );
    } catch (error: any) {
      console.error(error);
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
