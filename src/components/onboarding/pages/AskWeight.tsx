import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { Button } from "../../ui/button";
import { Text } from "../../ui/text";
import { View } from "react-native";
import { useState } from "react";
import SafeAreaWrapper from "../../SafeAreaWrapper";
import { OnboardingPageProps } from "../OnboardingScreen";
import { Input } from "../../ui/input";
import { set } from "react-hook-form";
import { lbsToKg, kgToLbs } from "@/src/utils/measurementConversion";
const AskWeight = ({ updateAnswer }: OnboardingPageProps) => {
  const [weight, setWeight] = useState<string | null>(null);
  const [mode, setMode] = useState<"metric" | "imperial">("imperial");
  const regex = /^\d{0,4}(\.\d?)?$/;

  const handleWeightChange = (value: string) => {
    const trimmed = value.trim();
    if (value === "") {
      setWeight(null);
      updateAnswer("weight", null);
      return;
    }
    if (!regex.test(trimmed)) return;
    let num = parseFloat(trimmed);
    if (isNaN(num)) {
      setWeight(null);
      updateAnswer("weight", null);
      return;
    }
    if (num > 999.9) {
      num = num / 10;
    }
    if (mode === "metric") {
      num = Math.min(num, 453.5);
      setWeight(num.toString());
      updateAnswer("weight", num);
      return;
    }
    const kgs = lbsToKg(num);
    setWeight(num.toString());
    updateAnswer("weight", kgs);
    return;
  };

  const modeChange = (mode: "imperial" | "metric") => {
    setMode(mode);
    if (weight === null) {
      updateAnswer("weight", null);
      return;
    }
    if (mode === "imperial") {
      const lbs = kgToLbs(parseFloat(weight));
      setWeight(lbs.toString());
    } else {
      const kgs = lbsToKg(parseFloat(weight));
      setWeight(kgs.toString());
    }
  };

  return (
    <SafeAreaWrapper backgroundColor="bg-background">
      <Animated.View
        entering={FadeInDown.duration(600)}
        className="flex-1 justify-center items-center"
      >
        <Animated.Image
          entering={FadeInUp.duration(600).delay(300)}
          source={require("@/src/assets/images/icon.png")}
          className="w-full h-64 mb-20"
          resizeMode="contain"
        />
        <Animated.Text
          entering={FadeIn.duration(600)}
          className="text-2xl font-bold mb-6 text-center"
        >
          What is your weight?
        </Animated.Text>
        <View className="max-w-60 items-center justify-center">
          <View className="flex-row">
            <Button
              onPress={() => {
                modeChange("imperial");
              }}
              variant={mode === "imperial" ? "default" : "outline"}
              className="flex-1 rounded-r-none"
            >
              <Text className="text-2xl font-bold">Lbs</Text>
            </Button>
            <Button
              onPress={() => {
                modeChange("metric");
              }}
              variant={mode === "metric" ? "default" : "outline"}
              className="flex-1 rounded-l-none"
            >
              <Text className="text-2xl font-bold">Kg</Text>
            </Button>
          </View>
          <View className="flex-row h-11 native:h-14 mt-4">
            <Input
              className="flex-1 ml-4"
              textAlign="right"
              placeholder={mode === "imperial" ? "lbs" : "kg"}
              keyboardType="numeric"
              autoComplete="off"
              value={weight || ""}
              onChangeText={handleWeightChange}
              maxLength={5}
            />
          </View>
        </View>
      </Animated.View>
    </SafeAreaWrapper>
  );
};

export default AskWeight;
