import { View } from "react-native";
import React, { useEffect } from "react";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Button } from "../../ui/button";
import { Text } from "@/src/components/ui/text";
import { OnboardingPageProps } from "../OnboardingScreen";

const Welcome = ({ updateAnswer }: OnboardingPageProps) => {
  useEffect(() => {
    updateAnswer("welcome", null);
  }, []);
  return (
    <Animated.View
      entering={FadeIn.duration(600)}
      className="flex-1 justify-center items-center p-8 gap-y-6"
    >
      <Text className="text-4xl font-bold text-center">
        Welcome to Rep Report
      </Text>
      <Text className="text-lg text-center text-muted-foreground">
        Your fitness journey starts here. Let's get to know you better!
      </Text>
      <Animated.Image
        entering={FadeInDown.duration(600).delay(300)}
        source={require("@/src/assets/images/icon.png")}
        className="w-full h-64 mt-5"
        resizeMode="contain"
      />
    </Animated.View>
  );
};

export default Welcome;
