import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { type ChartPoint, ProgressLineChart } from "@/features/charts/components/ProgressLineChart";

type MeasurementTrendChartProps = {
  /** Oldest first, already in display units. */
  points: ChartPoint[];
  /** e.g. "BODY WEIGHT · LB". */
  caption: string;
};

/** A body measurement over time, in the bordered panel the Trends tab uses. */
export function MeasurementTrendChart({ points, caption }: MeasurementTrendChartProps) {
  return (
    <View className="border-border bg-surface-sunken gap-3 rounded-lg border p-4">
      <ProgressLineChart
        points={points}
        height={180}
        emptyMessage="Add a second entry to see the trend."
        formatY={(value) => String(Math.round(value))}
      />
      {points.length >= 2 ? (
        <Text variant="meta" className="text-text-3 text-center">
          {caption}
        </Text>
      ) : null}
    </View>
  );
}
