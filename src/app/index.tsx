import { View, Text } from "react-native";
import React from "react";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import { OnboardingScreen } from "@/src/components/onboarding/OnboardingScreen";

const Index = () => {
  return (
    <SafeAreaWrapper>
      <OnboardingScreen />
    </SafeAreaWrapper>
  );
};

export default Index;
