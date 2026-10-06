import { View } from "react-native";

import { EmptyState, ErrorState } from "@/components/common";
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
  /** Newest first. */
  rows: MeasurementHistoryRow[];
  emptyMessage: string;
  errorMessage: string;
  onRetry?: () => void;
};

/** Dated entries as hairline rows: date on the left, value in mono on the right. */
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
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </View>
    );
  }

  if (error) {
    return <ErrorState title={errorMessage} onRetry={onRetry} />;
  }

  if (rows.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <View>
      {rows.map((row) => (
        <View
          key={row.id}
          className="border-separator -mx-4 h-12 flex-row items-center justify-between border-b px-4"
        >
          <Text variant="meta" className="text-text-3">
            {row.dateText.toUpperCase()}
          </Text>
          <Text variant="numeral" className="text-[15px]">
            {row.valueText}
          </Text>
        </View>
      ))}
    </View>
  );
}
