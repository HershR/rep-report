import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { THEME } from "@/lib/theme";

/**
 * The app's three non-content states - loading, empty, error - in one place, so
 * every screen says "nothing here" and "that failed" the same way. Each is a
 * plain centered column with no border, so it reads correctly inline in a list
 * as well as filling a screen.
 */

type StateAction = { label: string; onPress: () => void };

function StateFrame({ className, children }: { className?: string; children: ReactNode }) {
  return <View className={cn("items-center gap-3 px-4 py-8", className)}>{children}</View>;
}

function Actions({ actions }: { actions: StateAction[] }) {
  if (actions.length === 0) return null;
  return (
    <View className="mt-1 w-full max-w-72 gap-2">
      {actions.map((action) => (
        <Button key={action.label} variant="outline" onPress={action.onPress}>
          <Text>{action.label}</Text>
        </Button>
      ))}
    </View>
  );
}

export function LoadingState({ label, className }: { label?: string; className?: string }) {
  return (
    <StateFrame className={className}>
      <ActivityIndicator color={THEME.primary} />
      {label ? <Text variant="meta">{label.toUpperCase()}</Text> : null}
    </StateFrame>
  );
}

export function EmptyState({
  message,
  actions = [],
  className,
}: {
  message: string;
  actions?: StateAction[];
  className?: string;
}) {
  return (
    <StateFrame className={className}>
      <Text variant="body" className="text-text-3 text-center">
        {message}
      </Text>
      <Actions actions={actions} />
    </StateFrame>
  );
}

export function ErrorState({
  title,
  message,
  onRetry,
  actions = [],
  className,
}: {
  title: string;
  message?: string;
  /** Adds a "Try again" action first. */
  onRetry?: () => void;
  actions?: StateAction[];
  className?: string;
}) {
  const allActions = onRetry ? [{ label: "Try again", onPress: onRetry }, ...actions] : actions;
  return (
    <StateFrame className={className}>
      <Text variant="itemTitle" className="text-center">
        {title}
      </Text>
      {message ? (
        <Text variant="body" className="text-text-3 text-center">
          {message}
        </Text>
      ) : null}
      <Actions actions={allActions} />
    </StateFrame>
  );
}
