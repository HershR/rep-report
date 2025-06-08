import { useEffect, useState } from "react";
import { View } from "react-native";
import { OnboardingProgress } from "@/src/components/onboarding/OnboardingProgress";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import Welcome from "./pages/Welcome";
import AskAge from "./pages/AskAge";
import AskHeight from "./pages/AskHeight";
import AskWeight from "./pages/AskWeight";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SafeAreaWrapper from "../SafeAreaWrapper";
import ActivityLoader from "../ActivityLoader";

export interface OnboardingPageProps {
  onContinue: () => void;
}
export function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  const pages = [Welcome, AskAge, AskHeight, AskWeight];
  const totalPages = pages.length;

  useEffect(() => {
    const checkOnboardingComplete = async () => {
      const onboardingComplete = await AsyncStorage.getItem(
        "onboardingComplete"
      );
      if (onboardingComplete === "true") {
        router.replace("/(tabs)/dashboard");
      }
      setIsLoading(false);
    };
    checkOnboardingComplete();
  }, []);
  if (isLoading) {
    return (
      <View className="flex-1">
        <ActivityLoader />
      </View>
    );
  }
  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (currentStep + 1 === totalPages) {
      await AsyncStorage.setItem("onboardingComplete", "true");
      router.replace("/(tabs)/dashboard");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    Haptics.selectionAsync();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderContent = () => {
    const CurrentPage = pages[currentStep];
    return <CurrentPage onContinue={handleContinue} />;
  };

  const shouldShowProgress = currentStep > 0 && currentStep <= pages.length;

  return (
    <View className="flex-1">
      {shouldShowProgress && (
        <OnboardingProgress
          currentStep={currentStep}
          totalSteps={pages.length}
          onBack={handleBack}
        />
      )}
      {renderContent()}
    </View>
  );
}
