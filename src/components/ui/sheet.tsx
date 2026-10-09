import { Icon } from "@/components/ui/icon";
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@rn-primitives/dialog";
import { X } from "lucide-react-native";
import * as React from "react";
import {
  Platform,
  useWindowDimensions,
  View,
  type ViewProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens";
import {
  ReduceMotion,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";

/**
 * A bottom sheet, built on the same `@rn-primitives/dialog` + `PortalHost` foundation
 * as `AlertDialog`/`Dialog` rather than a second overlay library. RNR's own component
 * registry has no dedicated "Sheet" file to copy (unlike shadcn/ui web) — this is a
 * project-authored equivalent that anchors content to the bottom edge and slides it in.
 *
 * Positioning is deliberately explicit rather than flex-based: `PortalHost` renders a
 * style-less Fragment, and relying on `justify-end` reaching content through an
 * `asChild`-merged animated Pressable (plus a percentage `max-h` resolving through an
 * auto-height chain) proved fragile — the sheet drifted to the screen center and left a
 * scrim gap below it. Instead the dim scrim is `absolute inset-0` and the content is
 * pinned with `absolute ... bottom-0` and an explicit pixel `maxHeight`, so neither
 * depends on ambiguous flex/percentage resolution. On iOS the whole thing renders inside
 * react-native-screens' `FullWindowOverlay` (a real full-window layer, matching
 * `Dialog`/`AlertDialog`); on Android that degrades to a Fragment and resolves against
 * the same full-screen frame `Dialog` already uses successfully.
 *
 * Dismissal is via the close button, each consumer's explicit action (e.g. a "Done"
 * button), and `onOpenChange` — there is no drag-to-dismiss gesture.
 */
const Sheet = DialogPrimitive.Root;

const SheetTrigger = DialogPrimitive.Trigger;

const SheetPortal = DialogPrimitive.Portal;

const SheetClose = DialogPrimitive.Close;

const FullWindowOverlay =
  Platform.OS === "ios" ? RNFullWindowOverlay : React.Fragment;

// Cap the sheet at this fraction of the screen height so a long list can't cover it all.
const MAX_HEIGHT_FRACTION = 0.85;

function SheetContent({
  className,
  portalHost,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  portalHost?: string;
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <SheetPortal hostName={portalHost}>
      <FullWindowOverlay>
        {/* Dim scrim: fills the whole screen, sits below the sheet. */}
        <DialogPrimitive.Overlay className="absolute bottom-0 left-0 right-0 top-0 bg-black/50" />

        {/* Sheet: pinned to the bottom edge with an explicit pixel cap. */}
        <NativeOnlyAnimatedView
          entering={SlideInDown.duration(220).reduceMotion(ReduceMotion.System)}
          exiting={SlideOutDown.duration(180).reduceMotion(ReduceMotion.System)}
          style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
        >
          <DialogPrimitive.Content
            className={cn(
              "bg-background border-border w-full gap-4 rounded-t-xl border-t p-6 shadow-lg shadow-black/5",
              className,
            )}
            style={{
              maxHeight: height * MAX_HEIGHT_FRACTION,
              paddingBottom: insets.bottom + 24,
            }}
            {...props}
          >
            <>{children}</>
            <DialogPrimitive.Close
              className="absolute right-4 top-4 z-10 rounded opacity-70 active:opacity-100"
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
        </NativeOnlyAnimatedView>
      </FullWindowOverlay>
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
