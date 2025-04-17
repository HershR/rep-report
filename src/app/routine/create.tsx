import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import React from "react";
import RoutineForm from "@/src/components/forms/RoutineForm";
import { SafeAreaView } from "react-native-safe-area-context";

const CreateRoutine = () => {
  return (
    <View className="flex-1 bg-secondary">
      <SafeAreaView className="flex-1 mx-8 my-10">
        <KeyboardAvoidingView
          className="relative flex-1 justify-start items-center"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Text>CreateRoutine</Text>
          <RoutineForm />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default CreateRoutine;
