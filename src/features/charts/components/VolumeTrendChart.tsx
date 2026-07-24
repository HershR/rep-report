import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { ProgressLineChart } from "@/features/charts/components/ProgressLineChart";
import { useVolumeTrend } from "@/features/charts/hooks/useVolumeTrend";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { toDisplayWeight } from "@/lib/units";

export function VolumeTrendChart() {
  const { appSettings } = useAppSettings();
  const weightUnit = appSettings?.weightUnit ?? "lb";
  const { data, isLoading } = useVolumeTrend();

  if (isLoading) return null;

  const series = data ?? [];
  const points = series.map((point) => ({
    t: point.t,
    value: Math.round(toDisplayWeight(point.totalVolumeKg, weightUnit)),
  }));

  return (
    <View className="gap-3">
      <Text variant="large">Volume trend</Text>
      <ProgressLineChart
        points={points}
        emptyMessage="Complete a couple of workouts to see your volume trend."
      />
      <Text variant="muted" className="text-center text-xs">
        {`Total volume per day · ${weightUnit} · last 3 months`}
      </Text>
    </View>
  );
}
