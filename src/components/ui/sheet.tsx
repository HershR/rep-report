import { Icon } from "@/components/ui/icon";
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@rn-primitives/dialog";
import { X } from "lucide-react-native";
import * as React from "react";
import {
  Platform,
  View,
  type GestureResponderEvent,
  type ViewProps,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  FadeOut,
  ReduceMotion,
  runOnJS,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

/**
 * A bottom sheet, built on the same `@rn-primitives/dialog` + `PortalHost` foundation
 * as `AlertDialog`/`Dialog` rather than a second overlay library. RNR's own component
 * registry has no dedicated "Sheet" file to copy (unlike shadcn/ui web) — this is a
 * project-authored equivalent that anchors content to the bottom edge and slides it in.
 *
 * Unlike `Dialog`/`AlertDialog`, the sheet does NOT wrap its overlay in
 * react-native-screens' `FullWindowOverlay`: that renders in a separate iOS window
 * outside the root `GestureHandlerRootView`, which would break the swipe-to-dismiss
 * gesture. The app hides native headers and has no native layers to sit above, so the
 * portaled overlay already covers everything it needs to.
 */
const Sheet = DialogPrimitive.Root;

const SheetTrigger = DialogPrimitive.Trigger;

const SheetPortal = DialogPrimitive.Portal;

const SheetClose = DialogPrimitive.Close;

// Flick velocity (px/s) or drag past this fraction of the sheet's height dismisses it.
const DISMISS_VELOCITY = 500;
const DISMISS_FRACTION = 0.3;

function SheetOverlay({
  className,
  children,
  onPress,
  ...props
}: Omit<React.ComponentProps<typeof DialogPrimitive.Overlay>, "asChild"> & {
  children?: React.ReactNode;
}) {
  const { onOpenChange } = DialogPrimitive.useRootContext();

  function onOverlayPress(event: GestureResponderEvent) {
    onPress?.(event);
    if (event.target === event.currentTarget && !event.isDefaultPrevented()) {
      onOpenChange(false);
    }
  }

  return (
    <DialogPrimitive.Overlay
      className={cn(
        "absolute bottom-0 left-0 right-0 top-0 flex justify-end bg-black/50",
        className,
      )}
      {...props}
      onPress={Platform.select({ web: onOverlayPress, native: onPress })}
      asChild={Platform.OS !== "web"}
    >
      <NativeOnlyAnimatedView
        entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)}
        exiting={FadeOut.duration(150).reduceMotion(ReduceMotion.System)}
        as="Pressable"
      >
        <>{children}</>
      </NativeOnlyAnimatedView>
    </DialogPrimitive.Overlay>
  );
}

function SheetContent({
  className,
  portalHost,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  portalHost?: string;
}) {
  const { onOpenChange } = DialogPrimitive.useRootContext();
  const reducedMotion = useReducedMotion();
  const translateY = useSharedValue(0);
  const sheetHeight = useSharedValue(0);

  const close = React.useCallback(() => onOpenChange(false), [onOpenChange]);

  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const pan = React.useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((event) => {
          "worklet";
          // Follow the finger downward; give a little rubber-band resistance upward.
          translateY.value =
            event.translationY < 0
              ? event.translationY / 3
              : event.translationY;
        })
        .onEnd((event) => {
          "worklet";
          const draggedFarEnough =
            sheetHeight.value > 0
              ? translateY.value > sheetHeight.value * DISMISS_FRACTION
              : translateY.value > 120;
          if (event.velocityY > DISMISS_VELOCITY || draggedFarEnough) {
            runOnJS(close)();
          } else {
            translateY.value = reducedMotion
              ? withTiming(0, { duration: 200 })
              : withSpring(0, { duration: 500, dampingRatio: 0.8 });
          }
        }),
    [close, reducedMotion, sheetHeight, translateY],
  );

  return (
    <SheetPortal hostName={portalHost}>
      <SheetOverlay>
        <NativeOnlyAnimatedView
          entering={SlideInDown.duration(220).reduceMotion(ReduceMotion.System)}
          exiting={SlideOutDown.duration(180).reduceMotion(ReduceMotion.System)}
        >
          <Animated.View
            style={dragStyle}
            onLayout={(event) => {
              sheetHeight.value = event.nativeEvent.layout.height;
            }}
          >
            <DialogPrimitive.Content
              className={cn(
                "bg-background border-border max-h-[85%] w-full gap-4 rounded-t-xl border-t p-6 shadow-lg shadow-black/5",
                className,
              )}
              {...props}
            >
              <GestureDetector gesture={pan}>
                <View className="absolute left-0 right-0 top-0 z-10 items-center py-3">
                  <View className="bg-muted-foreground/40 h-1 w-10 rounded-full" />
                </View>
              </GestureDetector>
              <>{children}</>
              <DialogPrimitive.Close
                className="absolute right-4 top-4 rounded opacity-70 active:opacity-100"
                hitSlop={12}
              >
                <Icon
                  as={X}
                  className={cn(
                    "text-accent-foreground web:pointer-events-none size-4 shrink-0",
                  )}
                />
                <Text className="sr-only">Close</Text>
              </DialogPrimitive.Close>
            </DialogPrimitive.Content>
          </Animated.View>
        </NativeOnlyAnimatedView>
      </SheetOverlay>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: ViewProps) {
  return <View className={cn("flex flex-col gap-1.5", className)} {...props} />;
}

function SheetFooter({ className, ...props }: ViewProps) {
  return <View className={cn("flex flex-col gap-2", className)} {...props} />;
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "text-foreground text-lg font-semibold leading-none",
        className,
      )}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
