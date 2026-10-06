import { Text as SkiaText } from "@shopify/react-native-skia";
import { getISOWeek } from "date-fns";
import { View } from "react-native";
import { Bar, CartesianChart } from "victory-native";

import { EmptyState, ErrorState, LoadingState } from "@/components/common";
import { DeltaPill } from "@/components/DeltaPill";
import { Text } from "@/components/ui/text";
import { hslStringToRgb } from "@/features/charts/color";
import { WEEKLY_VOLUME_WEEKS, useWeeklyVolume } from "@/features/charts/hooks/useWeeklyVolume";
import { useChartFont } from "@/features/charts/useChartFont";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { THEME } from "@/lib/theme";
import { toDisplayWeight } from "@/lib/units";

const CHART_HEIGHT = 180;
const BAR_RADIUS = { topLeft: 4, topRight: 4 };

/**
 * Weekly training volume for the last eight weeks, as in the Progress mockup:
 * a headline total with its trend, then one bar per week. Past weeks are dim
 * and the current week is lit and labelled, so "this week so far" reads at a
 * glance. Empty weeks stay as gaps - a skipped week is part of the story.
 */
export function WeeklyVolumeChart() {
  const { weightUnit } = useAppSettings();
  const { weeks, previousTotalKg, isLoading, isError, refetch } = useWeeklyVolume();
  const axisFont = useChartFont(10);
  const valueFont = useChartFont(11);

  if (isLoading) return <LoadingState />;
  if (isError) {
    return <ErrorState title="Couldn't load your volume" onRetry={() => void refetch()} />;
  }

  const lastIndex = weeks.length - 1;
  const rows = weeks.map((week, index) => {
    const value = Math.round(toDisplayWeight(week.volumeKg, weightUnit));
    // Two series sharing one x: drawn as separate bars so the current week can
    // take its own color. The zero in the other series draws nothing.
    return {
      index,
      past: index === lastIndex ? 0 : value,
      current: index === lastIndex ? value : 0,
    };
  });
  const totalKg = weeks.reduce((sum, week) => sum + week.volumeKg, 0);
  const total = Math.round(toDisplayWeight(totalKg, weightUnit));
  // Against an empty earlier window a percentage would be a division by zero
  // dressed up as "+100%"; DeltaPill hides a zero.
  const percentChange =
    previousTotalKg > 0
      ? Math.round(((totalKg - previousTotalKg) / previousTotalKg) * 100)
      : 0;
  const currentValue = rows[lastIndex].current;

  const pastColor = hslStringToRgb(THEME.accentDim);
  const currentColor = hslStringToRgb(THEME.primary);
  const labelColor = hslStringToRgb(THEME.text3);
  const gridColor = hslStringToRgb(THEME.border);

  const weekLabel = (index: number) => {
    if (index === lastIndex) return "NOW";
    // Every other week, counting back from now, keeps the axis readable.
    return (lastIndex - index) % 2 === 0 ? `W${getISOWeek(weeks[index].weekStart)}` : "";
  };

  return (
    <View className="gap-4">
      <View className="flex-row items-end justify-between">
        <View>
          <Text variant="sectionLabel">{`VOLUME · LAST ${WEEKLY_VOLUME_WEEKS} WEEKS`}</Text>
          <View className="mt-2 flex-row items-baseline gap-2">
            <Text variant="hero" className="text-[34px]">
              {total.toLocaleString()}
            </Text>
            <Text className="text-text-4 text-sm font-semibold">{weightUnit}</Text>
          </View>
        </View>
        <DeltaPill
          value={percentChange}
          format={(magnitude) => `${magnitude}%`}
          accessibilityLabel={`${Math.abs(percentChange)}% ${
            percentChange > 0 ? "more" : "less"
          } volume than the ${WEEKLY_VOLUME_WEEKS} weeks before`}
        />
      </View>

      <View className="flex-row items-center justify-between">
        <Text variant="itemTitle">Weekly training volume</Text>
        <Text variant="microLabel">{weightUnit.toUpperCase()}</Text>
      </View>

      {totalKg === 0 ? (
        <EmptyState message="Finish a workout to start tracking weekly volume." />
      ) : (
        <View
          style={{ height: CHART_HEIGHT }}
          accessible
          accessibilityLabel={`Weekly volume, last ${WEEKLY_VOLUME_WEEKS} weeks. This week ${currentValue.toLocaleString()} ${weightUnit}.`}
        >
          <CartesianChart
            data={rows}
            xKey="index"
            yKeys={["past", "current"]}
            domain={{ y: [0] }}
            domainPadding={{ left: 18, right: 18, top: 28 }}
            axisOptions={{
              font: axisFont,
              // No y ticks: the headline carries the scale, and the current week
              // is labelled directly - the mockup's spare look.
              tickValues: { x: rows.map((row) => row.index), y: [] },
              labelColor,
              lineColor: gridColor,
              formatXLabel: (index) => weekLabel(Number(index)),
            }}
          >
            {({ points, chartBounds }) => {
              const currentPoint = points.current[lastIndex];
              const label = currentValue.toLocaleString();
              return (
                <>
                  <Bar
                    points={points.past}
                    chartBounds={chartBounds}
                    color={pastColor}
                    innerPadding={0.35}
                    roundedCorners={BAR_RADIUS}
                  />
                  <Bar
                    points={points.current}
                    chartBounds={chartBounds}
                    color={currentColor}
                    innerPadding={0.35}
                    roundedCorners={BAR_RADIUS}
                  />
                  {valueFont && currentValue > 0 && currentPoint?.y != null ? (
                    <SkiaText
                      x={currentPoint.x - valueFont.measureText(label).width / 2}
                      y={currentPoint.y - 6}
                      text={label}
                      font={valueFont}
                      color={currentColor}
                    />
                  ) : null}
                </>
              );
            }}
          </CartesianChart>
        </View>
      )}
    </View>
  );
}
