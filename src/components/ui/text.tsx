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
        h1: cn(
          "text-center text-4xl font-extrabold tracking-tight",
          Platform.select({ web: "scroll-m-20 text-balance" })
        ),
        h2: cn(
          "border-border border-b pb-2 text-3xl font-semibold tracking-tight",
          Platform.select({ web: "scroll-m-20 first:mt-0" })
        ),
        h3: cn("text-2xl font-semibold tracking-tight", Platform.select({ web: "scroll-m-20" })),
        h4: cn("text-xl font-semibold tracking-tight", Platform.select({ web: "scroll-m-20" })),
        p: "mt-3 leading-7 sm:mt-6",
        blockquote: "mt-4 border-l-2 pl-3 italic sm:mt-6 sm:pl-6",
        code: cn(
          "bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
        ),
        lead: "text-muted-foreground text-xl",
        large: "text-lg font-sans-semibold",
        small: "text-sm font-sans-medium leading-none",
        muted: "text-muted-foreground text-sm",

        /* Redesign scale. The shadcn variants above are kept as aliases
           until the screens are migrated, then removed. */
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
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  blockquote: Platform.select({ web: "blockquote" as Role }),
  code: Platform.select({ web: "code" as Role }),
};

const ARIA_LEVEL: Partial<Record<TextVariant, string>> = {
  h1: "1",
  h2: "2",
  h3: "3",
  h4: "4",
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
