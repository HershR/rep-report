import * as Haptics from "expo-haptics";
import { Check } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Pressable, useColorScheme } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";

const AUTO_DISMISS_MS = 1400;
const REDUCED_MOTION_DISMISS_MS = 900;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type WorkoutCompleteCelebrationProps = {
  /** Called exactly once, whether dismissed by tap or by the auto-dismiss timer. */
  onDone: () => void;
};

export function WorkoutCompleteCelebration({
  onDone,
}: WorkoutCompleteCelebrationProps) {
  const scheme = useColorScheme();
  const colors = THEME[scheme ?? "light"];
  const reducedMotion = useReducedMotion();

  const iconScale = useSharedValue(reducedMotion ? 1 : 0.5);
  const textOpacity = useSharedValue(reducedMotion ? 1 : 0);
  const textTranslateY = useSharedValue(reducedMotion ? 0 : 8);

  const hasFinishedRef = useRef(false);
  const finish = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    onDone();
  };

  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (!reducedMotion) {
      iconScale.value = withSpring(1, { duration: 500, dampingRatio: 0.65 });
      textOpacity.value = withDelay(100, withTiming(1, { duration: 200 }));
      textTranslateY.value = withDelay(100, withTiming(0, { duration: 200 }));
    }

    const timer = setTimeout(
      finish,
      reducedMotion ? REDUCED_MOTION_DISMISS_MS : AUTO_DISMISS_MS,
    );
    return () => clearTimeout(timer);
    // Intentionally runs once on mount only — re-running on shared-value/finish identity
    // changes would restart the timer and re-fire the haptic.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <AnimatedPressable
      onPress={finish}
      entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)}
      exiting={FadeOut.duration(150).reduceMotion(ReduceMotion.System)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        backgroundColor: colors.background,
      }}
    >
      <Animated.View
        style={[
          iconStyle,
          {
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: colors.chart2,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Icon
          as={Check}
          size={48}
          strokeWidth={3}
          color={colors.primaryForeground}
        />
      </Animated.View>
      <Animated.View style={textStyle}>
        <Text variant="h2">Nice work!</Text>
      </Animated.View>
    </AnimatedPressable>
  );
}
