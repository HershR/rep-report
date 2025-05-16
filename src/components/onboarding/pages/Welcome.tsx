import { View } from "react-native";
import React from "react";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Button } from "../../ui/button";
import { Text } from "@/src/components/ui/text";

interface WelcomeProps {
  onContinue: () => void;
  onSkip: () => void;
}

const Welcome = ({ onContinue, onSkip }: WelcomeProps) => {
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
      <Button className="w-2/3" onPress={onContinue}>
        <Text className="text-lg font-semibold">Get Started</Text>
      </Button>
      <Button className="w-2/3 mx-4" variant={"outline"} onPress={onSkip}>
        <Text className="text-lg font-semibold">Skip</Text>
      </Button>
    </Animated.View>
  );
};

export default Welcome;
