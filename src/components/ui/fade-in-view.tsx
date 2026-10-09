import * as React from "react";
import Animated, { FadeIn, ReduceMotion } from "react-native-reanimated";

/**
 * Transparent wrapper that fades its children in on mount — put it around a
 * resolved-content branch so the skeleton/spinner → content swap doesn't teleport.
 *
 * Intentionally carries no layout styles: NativeWind's `className` interop isn't
 * registered for reanimated's `Animated.View` in this project, so keep your own
 * layout container (gap/flex) *inside* the wrapper rather than on it.
 */
export function FadeInView({ children }: { children: React.ReactNode }) {
  return (
    <Animated.View
      entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)}
    >
      {children}
    </Animated.View>
  );
}
