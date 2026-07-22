import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";

export type MeasurementHistoryRow = {
  id: string;
  dateText: string;
  valueText: string;
};

type MeasurementHistoryListProps = {
  isLoading: boolean;
  error: unknown;
  rows: MeasurementHistoryRow[];
  emptyMessage: string;
  errorMessage: string;
  onRetry?: () => void;
};

export function MeasurementHistoryList({
  isLoading,
  error,
  rows,
  emptyMessage,
  errorMessage,
  onRetry,
}: MeasurementHistoryListProps) {
  if (isLoading) {
    return (
      <View className="gap-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="gap-2">
        <Text className="text-destructive text-sm">{errorMessage}</Text>
        {onRetry ? (
          <Button variant="outline" size="sm" onPress={onRetry}>
            <Text>Retry</Text>
          </Button>
        ) : null}
      </View>
    );
  }

  if (rows.length === 0) {
    return <Text variant="muted">{emptyMessage}</Text>;
  }

  return (
    <View className="gap-2">
      {rows.map((row) => (
        <Card
          key={row.id}
          className="flex-row items-center justify-between px-4 py-3"
        >
          <Text variant="muted">{row.dateText}</Text>
          <Text>{row.valueText}</Text>
        </Card>
      ))}
    </View>
  );
}
