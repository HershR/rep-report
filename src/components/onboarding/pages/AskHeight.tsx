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
import { cmToFeetInches, inchesToCm } from "@/src/utils/measurementConversion";
const AskAge = ({ updateAnswer }: OnboardingPageProps) => {
  const [height, setHeight] = useState<string | null>(null);
  const [feet, setFeet] = useState<string | null>(null);
  const [inches, setInches] = useState<string | null>(null);
  const [mode, setMode] = useState<"metric" | "imperial">("imperial");
  const cmRegex = /^\d{0,4}(\.\d?)?$/;
  const inchRegex = /^\d{0,3}(\.\d?)?$/;

  const handleHeightChangeMetric = (value: string) => {
    const trimmed = value.trim();
    if (trimmed === "") {
      setHeight(null);
      updateAnswer("height", null);
      return;
    }
    if (!cmRegex.test(trimmed)) return;
    let num = parseFloat(trimmed);
    if (num > 999.9) {
      num = num / 10;
      setHeight(num.toFixed(1));
    } else {
      setHeight(trimmed);
    }

    const { feet, inches } = cmToFeetInches(num);
    setFeet(feet.toString());
    setInches(inches.toString());
    updateAnswer("height", num);
    return;
  };
  const handleFeetChange = (value: string) => {
    const parsedValue = parseInt(value);
    if (!isNaN(parsedValue)) {
      setFeet(parsedValue.toString());
      const totalInches = parsedValue * 12 + parseInt(inches || "0");
      const cm = inchesToCm(totalInches);
      setHeight(cm.toString());
      updateAnswer("height", cm);
    } else {
      setFeet(null);
      if (inches === null) {
        setHeight(null);
        updateAnswer("height", null);
        return;
      }
      const totalInches = parseInt(inches || "0");
      const cm = inchesToCm(totalInches);
      setHeight(cm.toString());
      updateAnswer("height", cm);
    }
  };

  const handleInchesChange = (value: string) => {
    const trimmed = value.trim();
    if (trimmed === "") {
      setHeight(null);
      setInches(null);
      updateAnswer("height", null);
      return;
    }
    if (!inchRegex.test(trimmed)) {
      setInches(null);
      if (feet === null) {
        setHeight(null);

        updateAnswer("height", null);
        return;
      }
      const totalInches = parseInt(feet) * 12;
      const cm = inchesToCm(totalInches);
      setHeight(cm.toString());
      updateAnswer("height", cm);
      return;
    }

    let num = parseFloat(value);
    if (num > 11.9) {
      num = num / 10;
      setInches(num.toFixed(1));
    } else {
      setInches(trimmed);
    }
    const totalInches = parseInt(feet || "0") * 12 + num;
    const cm = inchesToCm(totalInches);
    setHeight(cm.toString());
    updateAnswer("height", cm);
    return;
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
                  keyboardType="number-pad"
                  autoComplete="off"
                  textAlign="right"
                  value={feet?.toString() || ""}
                  onChangeText={handleFeetChange}
                  maxLength={1}
                />
                <Text className="text-2xl font-semibold ml-1">'</Text>
                <Input
                  className="flex-1 ml-4"
                  textAlign="right"
                  placeholder="in"
                  keyboardType="number-pad"
                  autoComplete="off"
                  value={inches?.toString() || ""}
                  onChangeText={handleInchesChange}
                  maxLength={4}
                />
                <Text className="text-2xl font-semibold m1-1">''</Text>
              </>
            ) : (
              <>
                <Input
                  className="min-w-[50%]"
                  textAlign="right"
                  keyboardType="decimal-pad"
                  placeholder="cm"
                  autoComplete="off"
                  value={height?.toString() || ""}
                  onChangeText={handleHeightChangeMetric}
                  maxLength={5}
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
