import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import React from "react";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import { Button } from "@/src/components/ui/button";
import { ArrowRight } from "@/src/lib/icons/ArrowRight";
import { router, useLocalSearchParams } from "expo-router";
import RoutineForm from "@/src/components/RoutineForm";

const ViewRoutine = () => {
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
        <RoutineForm
          onSubmit={function (data: WorkoutRoutine): void {
            console.log(data);
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

export default ViewRoutine;
