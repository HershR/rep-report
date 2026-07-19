import { Icon } from "@/components/ui/icon";
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import * as AccordionPrimitive from "@rn-primitives/accordion";
import { ChevronDown } from "lucide-react-native";
import * as React from "react";
import Animated, {
  FadeIn,
  FadeOut,
  ReduceMotion,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root className={cn("w-full", className)} {...props} />
  );
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item className={cn(className)} {...props} />;
}

function AccordionTrigger({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof AccordionPrimitive.Trigger>, "children"> & {
  children: React.ReactNode;
}) {
  const { isExpanded } = AccordionPrimitive.useItemContext();

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: withTiming(isExpanded ? "180deg" : "0deg", { duration: 200 }) },
    ],
  }));

  return (
    <AccordionPrimitive.Header>
      <AccordionPrimitive.Trigger
        className={cn(
          "flex-row items-center justify-between gap-2 py-3",
          className,
        )}
        {...props}
      >
        <Text variant="muted">{children}</Text>
        <Animated.View style={chevronStyle}>
          <Icon as={ChevronDown} className="text-muted-foreground" size={18} />
        </Animated.View>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content className={cn("pb-3", className)} {...props}>
      <NativeOnlyAnimatedView
        entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)}
        exiting={FadeOut.duration(150).reduceMotion(ReduceMotion.System)}
      >
        <>{children}</>
      </NativeOnlyAnimatedView>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
