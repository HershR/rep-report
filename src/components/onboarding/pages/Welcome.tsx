import { TouchableOpacity, View } from "react-native";
import React, { useEffect } from "react";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Button } from "../../ui/button";
import { Text } from "@/src/components/ui/text";
import { OnboardingPageProps } from "../OnboardingScreen";

const Welcome = ({ onContinue }: OnboardingPageProps) => {
  return (
    <View className="flex-1">
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
          className="h-64 aspect-square mt-5"
          resizeMode="contain"
        />
      </Animated.View>
      <View className="items-center">
        <Button className="min-w-52" size={"lg"} onPress={onContinue}>
          <Text>Get Started</Text>
        </Button>
      </View>
    </View>
  );
};

export default Welcome;
