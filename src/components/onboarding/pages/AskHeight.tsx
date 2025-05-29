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
import { updateUserSetting } from "@/src/db/dbHelpers";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/src/db/schema";
import HeightSelector from "../../HeightSelector";

const AskAge = ({ onContinue }: OnboardingPageProps) => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const [mode, setMode] = useState<Unit>("imperial");
  const [height, setHeight] = useState<number>(0);

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

          <View>
            <HeightSelector
              heightCm={height}
              mode={mode}
              onChange={(newHeight) => setHeight(newHeight)}
            />
          </View>
        </View>
      </Animated.View>
      <View className="items-center">
        <Button
          className="min-w-52 mb-4"
          size={"lg"}
          disabled={height === null}
          onPress={async () => {
            if (height === null) {
              return;
            }
            await updateUserSetting(drizzleDb, "height", height.toString());
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

export default AskAge;
