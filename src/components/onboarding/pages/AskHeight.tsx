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
const AskAge = ({ updateAnswer }: OnboardingPageProps) => {
  const [height, setHeight] = useState<number | null>(null);
  const [feet, setFeet] = useState<number | null>(null);
  const [inches, setInches] = useState<number | null>(null);
  const [mode, setMode] = useState<"metric" | "imperial">("imperial");

  const handleHeightChangeMetric = (value: string) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      const cm = Math.round(parsedValue);
      setHeight(cm);
      const { feet, inches } = cmToFeet(cm);
      setFeet(feet);
      setInches(inches);
      updateAnswer("height", cm);
    } else {
      setHeight(null);
    }
  };
  const handleFeetChange = (value: string) => {
    const parsedValue = parseFloat(value.slice(0, 2));
    if (!isNaN(parsedValue)) {
      setFeet(parsedValue);
      const totalInches = parsedValue * 12 + (inches || 0);
      const cm = inchesToCm(totalInches);
      setHeight(cm);
      updateAnswer("height", cm);
    } else {
      setFeet(null);
    }
  };

  const handleInchesChange = (value: string) => {
    const parsedValue = parseFloat(value.slice(0, 2));

    if (!isNaN(parsedValue)) {
      const inches = Math.min(11, parsedValue);
      setInches(inches);
      const totalInches = (feet || 0) * 12 + inches;
      const cm = inchesToCm(totalInches);
      setHeight(cm);
      updateAnswer("height", cm);
    } else {
      setInches(null);
    }
  };

  const inchesToCm = (inches: number) => {
    return Math.round(inches * 2.54);
  };

  const cmToInches = (cm: number) => {
    return Math.round(cm / 2.54);
  };
  const cmToFeet = (cm: number) => {
    const totalInches = cmToInches(cm);
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
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
              <Text className="text-2xl font-bold">Feet</Text>
            </Button>
            <Button
              onPress={() => {
                setMode("metric");
              }}
              variant={mode === "metric" ? "default" : "outline"}
              className="flex-1 rounded-l-none"
            >
              <Text className="text-2xl font-bold">Cm</Text>
            </Button>
          </View>
          <View className="flex-row h-11 native:h-14 mt-4">
            {mode === "imperial" ? (
              <>
                <Input
                  className="flex-1"
                  placeholder="ft"
                  keyboardType="numeric"
                  autoComplete="off"
                  textAlign="right"
                  value={feet?.toString() || ""}
                  onChangeText={handleFeetChange}
                />
                <Text className="text-2xl font-semibold ml-1">'</Text>
                <Input
                  className="flex-1 ml-4"
                  textAlign="right"
                  placeholder="in"
                  keyboardType="numeric"
                  autoComplete="off"
                  value={inches?.toString() || ""}
                  onChangeText={handleInchesChange}
                />
                <Text className="text-2xl font-semibold m1-1">''</Text>
              </>
            ) : (
              <>
                <Input
                  className="min-w-[50%]"
                  textAlign="right"
                  keyboardType="numeric"
                  placeholder="cm"
                  autoComplete="off"
                  value={height?.toString() || ""}
                  onChangeText={handleHeightChangeMetric}
                ></Input>
                <Text className="text-2xl ml-2 self-center mb-1.5">cm</Text>
              </>
            )}
          </View>
        </View>
      </Animated.View>
    </SafeAreaWrapper>
  );
};

export default AskAge;
