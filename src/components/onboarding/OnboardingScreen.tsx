import { useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { OnboardingProgress } from "@/src/components/onboarding/OnboardingProgress";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import { useRouter } from "expo-router";
import React from "react";
import { Text } from "../ui/text";
import Welcome from "./pages/Welcome";
import AskAge from "./pages/AskAge";
import AskHeight from "./pages/AskHeight";
import AskWeight from "./pages/AskWeight";

export interface OnboardingPageProps {
  selectedAnswer: any;
  updateAnswer: (key: string, answer: any | null) => void;
}
export function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, [string, any | null]>>(
    {}
  );

  const router = useRouter();
  const pages = [AskWeight];
  const totalPages = pages.length;
  console.log("answers", answers);
  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (currentStep + 1 === totalPages) {
      router.replace("/(tabs)/home");
      return;
    }
    setCurrentStep(currentStep + 1);
  };
  const handleSkip = () => {
    Haptics.selectionAsync();
    router.replace("/(tabs)/home");
  };

  const handleBack = () => {
    Haptics.selectionAsync();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderContent = () => {
    const CurrentPage = pages[currentStep];
    return (
      <CurrentPage
        selectedAnswer={answers[currentStep]?.[1] || null}
        updateAnswer={(key: string, answer: any) => {
          setAnswers((prev) => ({ ...prev, [currentStep]: [key, answer] }));
        }}
      />
    );
  };

  const shouldShowProgress = currentStep > 0 && currentStep <= pages.length;
  const isWelcomeScreen = currentStep === 0;

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
      {currentStep <= pages.length && (
        <Animated.View entering={FadeIn.duration(600)}>
          <TouchableOpacity
            className="items-center border-md m-2 p-4"
            style={[!answers[currentStep] ? styles.disabledButton : null]}
            onPress={handleContinue}
            disabled={!answers[currentStep]}
          >
            <Text className="text-lg font-semibold text-primary">
              {isWelcomeScreen ? "Get Started" : "Continue"}
            </Text>
          </TouchableOpacity>
          {currentStep < totalPages && (
            <TouchableOpacity
              className="items-center border-md m-2 "
              onPress={handleSkip}
            >
              <Text className="text-lg font-semibold text-primary">Skip</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    // color: Colors.light.primary,
  },
  welcomeSubtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#666",
    lineHeight: 26,
    marginBottom: 40,
  },
  welcomeImage: {
    width: "100%",
    height: 300,
    marginTop: 20,
  },
  questionContainer: {
    flex: 1,
    padding: 20,
  },
  question: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  option: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOption: {
    // borderColor: Colors.light.primary,
    backgroundColor: "#E3F2FD",
  },
  optionText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  selectedOptionText: {
    // color: Colors.light.primary,
    fontWeight: "600",
  },
  continueButton: {
    // backgroundColor: Colors.light.primary,
    padding: 16,
    margin: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
