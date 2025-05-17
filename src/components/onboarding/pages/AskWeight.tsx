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
const AskWeight = ({ updateAnswer }: OnboardingPageProps) => {
  const [weight, setWeight] = useState<string | null>(null);
  const [mode, setMode] = useState<"metric" | "imperial">("imperial");

  const handleWeightChange = (value: string) => {
    if (mode === "imperial") {
      //convert to kg
      const lbs = parseFloat(value);
      if (!isNaN(lbs)) {
        setWeight(lbs.toString());
        updateAnswer("weight", lbs);
      } else {
        setWeight(null);
        updateAnswer("weight", 0);
      }
    } else {
      const kgs = parseFloat(value);
      if (!isNaN(kgs)) {
        const lbs = kgToLbs(kgs);
        setWeight(lbs.toString());
        updateAnswer("weight", lbs);
      } else {
        setWeight(null);
        updateAnswer("weight", 0);
      }
    }
  };
  const lbsToKg = (lbs: number) => {
    return parseFloat((lbs * 0.453592).toFixed(1));
  };
  const kgToLbs = (kg: number) => {
    return parseFloat((kg / 0.453592).toFixed(1));
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
          How tall are you?
        </Animated.Text>
        <View className="max-w-60 items-center justify-center">
          <View className="flex-row">
            <Button
              onPress={() => {
                setMode("imperial");
              }}
              variant={mode === "imperial" ? "default" : "outline"}
              className="flex-1 rounded-r-none"
            >
              <Text className="text-2xl font-bold">Lbs</Text>
            </Button>
            <Button
              onPress={() => {
                setMode("metric");
              }}
              variant={mode === "metric" ? "default" : "outline"}
              className="flex-1 rounded-l-none"
            >
              <Text className="text-2xl font-bold">Kg</Text>
            </Button>
          </View>
          <View className="flex-row h-11 native:h-14 mt-4">
            {mode === "imperial" ? (
              <>
                <Input
                  className="flex-1 ml-4"
                  textAlign="right"
                  placeholder="lbs"
                  keyboardType="numeric"
                  autoComplete="off"
                  value={weight || ""}
                  onChangeText={handleWeightChange}
                  maxLength={2}
                />
              </>
            ) : (
              <>
                <Input
                  className="min-w-[50%]"
                  textAlign="right"
                  keyboardType="numeric"
                  placeholder="kg"
                  autoComplete="off"
                  value={lbsToKg(parseFloat(weight || "")).toString() || ""}
                  onChangeText={handleWeightChange}
                  maxLength={weight?.split(".").length === 1 ? 4 : 5}
                ></Input>
              </>
            )}
          </View>
        </View>
      </Animated.View>
    </SafeAreaWrapper>
  );
};

export default AskWeight;
