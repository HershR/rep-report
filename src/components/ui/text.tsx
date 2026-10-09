import { cn } from "@/lib/utils";
import { Slot } from "@rn-primitives/slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Platform, Text as RNText, type Role } from "react-native";

const textVariants = cva(
  cn(
    "text-foreground font-sans text-base",
    Platform.select({
      web: "select-text",
    })
  ),
  {
    variants: {
      variant: {
        default: "",
        /* The app's type scale. The old shadcn variants (h1-h4, muted, ...)
           were removed once every screen moved onto this one. */
        screenTitle: "font-sans-extrabold text-[26px] tracking-[-0.03em]",
        hero: "font-sans-extrabold text-[42px] leading-none tracking-[-0.04em]",
        itemTitle: "font-sans-semibold text-[15px] tracking-[-0.012em]",
        cardTitle: "font-sans-bold text-[17px] tracking-[-0.02em]",
        body: "text-text-2 text-sm leading-[1.5]",
        meta: "text-text-3 font-mono text-[11px] tracking-[0.06em]",
        /* uppercase the string at the call site - RN has no text-transform
           on Android for all faces */
        sectionLabel: "text-text-3 font-mono-semibold text-[10px] tracking-[0.16em]",
        microLabel: "text-text-3 font-mono-semibold text-[9px] tracking-[0.16em]",
        numeral: "font-mono-semibold text-[19px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type TextVariantProps = VariantProps<typeof textVariants>;

type TextVariant = NonNullable<TextVariantProps["variant"]>;

const ROLE: Partial<Record<TextVariant, Role>> = {
  screenTitle: "heading",
  cardTitle: "heading",
};

const ARIA_LEVEL: Partial<Record<TextVariant, string>> = {
  screenTitle: "1",
  cardTitle: "2",
};

const TextClassContext = React.createContext<string | undefined>(undefined);

/** Digits share one advance width, so numbers in a column line up. */
const TABULAR = { fontVariant: ["tabular-nums" as const] };

function Text({
  className,
  asChild = false,
  variant = "default",
  ...props
}: React.ComponentProps<typeof RNText> &
  React.RefAttributes<typeof RNText> &
  TextVariantProps & {
    asChild?: boolean;
  }) {
  const textClass = React.useContext(TextClassContext);
  const Component = asChild ? Slot : RNText;
  const tabular = variant === "numeral" || variant === "hero";
  return (
    <Component
      style={tabular ? TABULAR : undefined}
      className={cn(textVariants({ variant }), textClass, className)}
      role={variant ? ROLE[variant] : undefined}
      aria-level={variant ? ARIA_LEVEL[variant] : undefined}
      {...props}
    />
  );
}

export { Text, TextClassContext };
