import { Pressable, View } from "react-native";
import React from "react";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Text } from "./ui/text";
import { ChevronDown } from "../lib/icons/ChevronDown";

interface AccordionProps {
  title: string;
  isOpened: boolean;
  children: React.ReactNode;
  duration?: number;
  onToggle?: () => void;
}

const CustomAccordion = ({
  isOpened,
  title,
  children,
  duration = 500,
  onToggle = () => {},
}: AccordionProps) => {
  const height = useSharedValue(0);

  const animatedRotateStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: isOpened ? "0deg" : "180deg",
        },
      ],
    };
  });
  return (
    <Animated.View layout={LinearTransition} className="overflow-hidden">
      <Animated.View layout={LinearTransition}>
        <Pressable
          onPress={() => onToggle()}
          className="flex-row py-3 items-center"
        >
          <View className="flex-1">
            <Text className="native:text-lg font-semibold">{title}</Text>
          </View>
          <Animated.View
            layout={LinearTransition.springify()}
            style={animatedRotateStyle}
          >
            <ChevronDown width={24} height={24} className="color-primary" />
          </Animated.View>
        </Pressable>
      </Animated.View>
      {isOpened && (
        <Animated.View
          className="items-center"
          layout={LinearTransition.duration(duration)}
          entering={FadeIn}
          exiting={FadeOut}
        >
          {children}
        </Animated.View>
      )}
    </Animated.View>
  );
};

export default CustomAccordion;
