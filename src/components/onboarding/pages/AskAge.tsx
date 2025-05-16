import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Button } from "../../ui/button";
import { Text } from "../../ui/text";
import { View } from "react-native";

const AskAge = ({ onContinue }: { onContinue: () => void }) => {
  return (
    <View className="flex-1 p-5">
      <Animated.Text
        entering={FadeIn.duration(600)}
        className="text-2xl font-bold mb-6 text-center"
      >
        When were you born?
      </Animated.Text>
    </View>
  );
};
