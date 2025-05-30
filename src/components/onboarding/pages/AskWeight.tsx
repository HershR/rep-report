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
import * as schema from "@/src/db/schema";

const AskWeight = ({ onContinue }: OnboardingPageProps) => {
  const [weight, setWeight] = useState<string | null>(null);
  const [mode, setMode] = useState<Unit>("imperial");
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
    if (mode === "metric") {
      num = kgToLbs(num);
    }
    if (num > 999.9) {
      num = num / 10;
      setWeight(num.toFixed(1));
    } else {
      setWeight(num.toString());
    }
  };

  const modeChange = (mode: Unit) => {
    setMode(mode);
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
          className="text-primary text-2xl font-bold mb-6 text-center"
        >
          What is your weight?
        </Animated.Text>
        <View className="max-w-60 items-center justify-center gap-y-4">
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
          <View className="w-full ">
            <Text className="text-lg font-medium">
              {mode === "imperial" ? "Weight (lb)" : "Weight (kg)"}:
            </Text>
            <Input
              className="min-w-full"
              textAlign="right"
              keyboardType="decimal-pad"
              autoComplete="off"
              value={
                mode === "imperial"
                  ? weight || ""
                  : weight
                  ? lbsToKg(parseFloat(weight || "0")).toString()
                  : ""
              }
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
            await createWeightEntry(drizzleDb, parseFloat(weight));
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
