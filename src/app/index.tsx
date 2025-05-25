import React from "react";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import { OnboardingScreen } from "@/src/components/onboarding/OnboardingScreen";

const Index = () => {
  return (
    <SafeAreaWrapper backgroundColor="bg-background">
      <OnboardingScreen />
    </SafeAreaWrapper>
  );
};

export default Index;
