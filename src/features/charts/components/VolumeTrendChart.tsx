import { View } from "react-native";

import { DeltaPill } from "@/components/DeltaPill";
import { Text } from "@/components/ui/text";
import { ProgressLineChart } from "@/features/charts/components/ProgressLineChart";
import { useVolumeTrend } from "@/features/charts/hooks/useVolumeTrend";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { toDisplayWeight } from "@/lib/units";

export function VolumeTrendChart() {
  const { appSettings } = useAppSettings();
  const weightUnit = appSettings?.weightUnit ?? "lb";
  const { recent, previous, isLoading } = useVolumeTrend();

  if (isLoading) return null;

  const points = recent.map((point) => ({
    t: point.t,
    value: Math.round(toDisplayWeight(point.totalVolumeKg, weightUnit)),
  }));

  // The headline number is the point of the panel; the line shows its shape.
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const previousTotalKg = previous.reduce(
    (sum, point) => sum + point.totalVolumeKg,
    0,
  );
  const recentTotalKg = recent.reduce(
    (sum, point) => sum + point.totalVolumeKg,
    0,
  );
  // With nothing logged in the window before, a percentage would be division by
  // zero dressed up as "+100%".
  const percentChange =
    previousTotalKg > 0
      ? Math.round(((recentTotalKg - previousTotalKg) / previousTotalKg) * 100)
      : 0;

  return (
    <View className="gap-3">
      <View className="flex-row items-end justify-between">
        <View>
          <Text variant="sectionLabel">
            {`VOLUME · LAST 3 MONTHS · ${weightUnit.toUpperCase()}`}
          </Text>
          <View className="mt-2 flex-row items-baseline gap-2">
            <Text variant="hero" className="text-[34px]">
              {total.toLocaleString()}
            </Text>
            <Text className="text-text-4 text-sm font-semibold">
              {weightUnit}
            </Text>
          </View>
        </View>
        <DeltaPill
          value={percentChange}
          format={(magnitude) => `${magnitude}%`}
          accessibilityLabel={`${Math.abs(percentChange)}% ${
            percentChange > 0 ? "more" : "less"
          } volume than the previous 3 months`}
        />
      </View>
      <ProgressLineChart
        points={points}
        emptyMessage="Train on two different days to see the shape of your volume."
      />
      {points.length > 1 ? (
        <Text variant="microLabel" className="text-center">
          TOTAL VOLUME PER DAY
        </Text>
      ) : null}
    </View>
  );
}
