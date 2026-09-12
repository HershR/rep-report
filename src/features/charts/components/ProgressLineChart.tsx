import { matchFont } from "@shopify/react-native-skia";
import { format } from "date-fns";
import { useColorScheme } from "nativewind";
import { useMemo } from "react";
import { Platform, View } from "react-native";
import { CartesianChart, Line } from "victory-native";

import { Text } from "@/components/ui/text";
import { hslStringToRgb } from "@/features/charts/color";
import { THEME } from "@/lib/theme";

export type ChartPoint = { t: number; value: number };

type ProgressLineChartProps = {
  points: ChartPoint[];
  emptyMessage: string;
  /** Formats the y-axis tick labels; defaults to rounded integer. */
  formatY?: (value: number) => string;
  height?: number;
};

const fontFamily = Platform.select({ ios: "Helvetica", default: "sans-serif" });

export function ProgressLineChart({
  points,
  emptyMessage,
  formatY,
  height = 220,
}: ProgressLineChartProps) {
  const { colorScheme: scheme } = useColorScheme();
  const colors = THEME[scheme ?? "light"];

  const font = useMemo(
    () => matchFont({ fontFamily: fontFamily ?? "sans-serif", fontSize: 11 }),
    [],
  );
  const lineColor = hslStringToRgb(colors.chart1);
  const labelColor = hslStringToRgb(colors.mutedForeground);
  const gridColor = hslStringToRgb(colors.border);

  if (points.length < 2) {
    return (
      <View
        style={{ height: height / 2 }}
        className="items-center justify-center"
      >
        <Text variant="body" className="text-text-3 text-center">
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ height }}>
      <CartesianChart
        data={points}
        xKey="t"
        yKeys={["value"]}
        domainPadding={{ left: 16, right: 16, top: 16, bottom: 8 }}
        axisOptions={{
          font,
          tickCount: 4,
          labelColor,
          lineColor: gridColor,
          formatXLabel: (value) => format(new Date(value), "MMM d"),
          formatYLabel: (value) =>
            formatY ? formatY(value) : String(Math.round(value)),
        }}
      >
        {({ points: chartPoints }) => (
          <Line
            points={chartPoints.value}
            color={lineColor}
            strokeWidth={2}
            curveType="linear"
            animate={{ type: "timing", duration: 300 }}
          />
        )}
      </CartesianChart>
    </View>
  );
}
