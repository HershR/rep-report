import { Icon } from "@/components/ui/icon";
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@rn-primitives/dialog";
import { X } from "lucide-react-native";
import * as React from "react";
import { Platform, View, type GestureResponderEvent, type ViewProps } from "react-native";
import { FadeIn, FadeOut, ReduceMotion, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens";

/**
 * A bottom sheet, built on the same `@rn-primitives/dialog` + `PortalHost` foundation
 * as `AlertDialog`/`Dialog` rather than a second overlay library. RNR's own component
 * registry has no dedicated "Sheet" file to copy (unlike shadcn/ui web) — this is a
 * project-authored equivalent that anchors content to the bottom edge and slides it in.
 */
const Sheet = DialogPrimitive.Root;

const SheetTrigger = DialogPrimitive.Trigger;

const SheetPortal = DialogPrimitive.Portal;

const SheetClose = DialogPrimitive.Close;

const FullWindowOverlay = Platform.OS === "ios" ? RNFullWindowOverlay : React.Fragment;

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
    <FullWindowOverlay>
      <DialogPrimitive.Overlay
        className={cn("absolute bottom-0 left-0 right-0 top-0 flex justify-end bg-black/50", className)}
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
    </FullWindowOverlay>
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
  return (
    <SheetPortal hostName={portalHost}>
      <SheetOverlay>
        <NativeOnlyAnimatedView
          entering={SlideInDown.duration(220).reduceMotion(ReduceMotion.System)}
          exiting={SlideOutDown.duration(180).reduceMotion(ReduceMotion.System)}
        >
          <DialogPrimitive.Content
            className={cn(
              "bg-background border-border max-h-[85%] w-full gap-4 rounded-t-xl border-t p-6 shadow-lg shadow-black/5",
              className
            )}
            {...props}
          >
            <>{children}</>
            <DialogPrimitive.Close
              className="absolute right-4 top-4 rounded opacity-70 active:opacity-100"
              hitSlop={12}
            >
              <Icon as={X} className={cn("text-accent-foreground web:pointer-events-none size-4 shrink-0")} />
              <Text className="sr-only">Close</Text>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
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

function SheetTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-foreground text-lg font-semibold leading-none", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description className={cn("text-muted-foreground text-sm", className)} {...props} />
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
