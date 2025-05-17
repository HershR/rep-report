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
  const [height, setHeight] = useState<string | null>(null);
  const [feet, setFeet] = useState<string | null>(null);
  const [inches, setInches] = useState<string | null>(null);
  const [mode, setMode] = useState<"metric" | "imperial">("imperial");

  const handleHeightChangeMetric = (value: string) => {
    if (!value) {
      setHeight(null);
    }
    const nums = value.split(".");
    if (nums.length > 2) {
      return;
    }
    if (nums.length == 1) {
      const num = parseInt(value);
      if (!isNaN(num)) {
        setHeight(num.toString());
        const cm = parseFloat(value);
        const { feet, inches } = cmToFeet(cm);
        setFeet(feet.toString());
        setInches(inches.toString());
        updateAnswer("height", cm);
      }
    } else {
      const num = nums[0] + "." + nums[1].slice(0, 1);
      setHeight(num);
      const cm = parseFloat(value);
      const { feet, inches } = cmToFeet(cm);
      setFeet(feet.toString());
      setInches(inches.toString());
      updateAnswer("height", cm);
    }
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
      const totalInches = parseInt(inches || "0");
      const cm = inchesToCm(totalInches);
      setHeight(cm.toString());
      updateAnswer("height", cm);
    }
  };

  const handleInchesChange = (value: string) => {
    const parsedValue = parseInt(value);

    if (!isNaN(parsedValue)) {
      const inches = Math.min(11, parsedValue);
      setInches(inches.toString());
      const totalInches = parseInt(feet || "0") * 12 + inches;
      const cm = inchesToCm(totalInches);
      setHeight(cm.toString());
      updateAnswer("height", cm);
    } else {
      setInches(null);
      const totalInches = parseInt(feet ?? "0");
      const cm = inchesToCm(totalInches);
      setHeight(cm.toString());
      updateAnswer("height", cm);
    }
  };

  const inchesToCm = (inches: number) => {
    return parseFloat((inches * 2.54).toFixed(1));
  };

  const cmToInches = (cm: number) => {
    return parseFloat((cm / 2.54).toFixed(1));
  };
  const cmToFeet = (cm: number) => {
    const totalInches = cmToInches(cm);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
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
                  maxLength={1}
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
                  maxLength={2}
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
                  maxLength={height?.split(".").length === 1 ? 4 : 5}
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
