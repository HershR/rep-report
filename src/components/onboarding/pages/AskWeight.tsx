import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { Button } from "../../ui/button";
import { Text } from "../../ui/text";
import { View } from "react-native";
import { useState } from "react";
import { OnboardingPageProps } from "../OnboardingScreen";
import { Input } from "../../ui/input";
import { lbsToKg, kgToLbs } from "@/src/utils/measurementConversion";
import { createWeightEntry } from "@/src/db/dbHelpers";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "@/src//db/schema";

const AskWeight = ({ onContinue }: OnboardingPageProps) => {
  const [weight, setWeight] = useState<string | null>(null);
  const [mode, setMode] = useState<Unit>(Unit.imperial);
  const regex = /^\d{0,4}(\.\d?)?$/;
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const handleWeightChange = (value: string) => {
    const trimmed = value.trim();
    if (value === "") {
      setWeight(null);
      return;
    }
    if (!regex.test(trimmed)) return;
    let num = parseFloat(trimmed);
    if (mode === Unit.imperial && num > 999.9) {
      num = num / 10;
      setWeight(num.toFixed(1));
    } else if (mode === Unit.metric && num > 453.5) {
      num = Math.min(num, 453.5);
      setWeight(num.toString());
    } else {
      setWeight(trimmed);
    }
  };

  const modeChange = (mode: Unit) => {
    setMode(mode);
    if (weight === null) {
      return;
    }
    if (mode === Unit.imperial) {
      const lbs = kgToLbs(parseFloat(weight));
      setWeight(lbs.toString());
    } else {
      const kgs = lbsToKg(parseFloat(weight));
      setWeight(kgs.toString());
    }
  };

  return (
    <View className="flex-1">
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
                modeChange(Unit.imperial);
              }}
              variant={mode === Unit.imperial ? "default" : "outline"}
              className="flex-1 rounded-r-none"
            >
              <Text className="text-2xl font-bold">Lbs</Text>
            </Button>
            <Button
              onPress={() => {
                modeChange(Unit.metric);
              }}
              variant={mode === Unit.metric ? "default" : "outline"}
              className="flex-1 rounded-l-none"
            >
              <Text className="text-2xl font-bold">Kg</Text>
            </Button>
          </View>
          <View className="flex-row h-11 native:h-14 mt-4">
            <Input
              className="flex-1"
              textAlign="right"
              placeholder={mode === Unit.imperial ? "lbs" : "kg"}
              keyboardType="decimal-pad"
              autoComplete="off"
              value={weight || ""}
              onChangeText={handleWeightChange}
              maxLength={5}
            />
          </View>
        </View>
      </Animated.View>
      <View className="items-center">
        <Button
          className="min-w-52 mb-4"
          size={"lg"}
          disabled={weight === null}
          onPress={async () => {
            if (weight === null) {
              return;
            }
            await createWeightEntry(drizzleDb, parseFloat(weight), mode);
            onContinue();
          }}
        >
          <Text>Continue</Text>
        </Button>
        <Button variant={"ghost"} size={"lg"} onPress={onContinue}>
          <Text>Skip</Text>
        </Button>
      </View>
    </View>
  );
};

export default AskWeight;
