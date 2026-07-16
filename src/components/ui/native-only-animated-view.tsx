import * as React from "react";
import { Platform, Pressable } from "react-native";
import Animated from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * This component is used to wrap animated views that should only be animated on native.
 * @param props - The props for the animated view.
 * @returns The animated view if the platform is native, otherwise the children.
 * @example
 * <NativeOnlyAnimatedView entering={FadeIn} exiting={FadeOut}>
 *   <Text>I am only animated on native</Text>
 * </NativeOnlyAnimatedView>
 */
function NativeOnlyAnimatedView(
  props:
    | (React.ComponentProps<typeof Animated.View> &
        React.RefAttributes<typeof Animated.View> & { as?: "View" })
    | (React.ComponentProps<typeof AnimatedPressable> &
        React.RefAttributes<typeof AnimatedPressable> & { as: "Pressable" })
) {
  if (Platform.OS === "web") {
    return <>{props.children as React.ReactNode}</>;
  } else {
    // The discriminated union above isn't narrowed cleanly by TS once spread onto
    // Animated's ref-forwarding component types, so we cast at the JSX boundary.
    if (props.as === "Pressable") {
      return <AnimatedPressable {...(props as any)} />;
    }
    return <Animated.View {...(props as any)} />;
  }
}

export { NativeOnlyAnimatedView };
