import { useState } from "react";
import { View } from "react-native";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import type { WeightUnit } from "@/db/schema";
import { ProgressLineChart } from "@/features/charts/components/ProgressLineChart";
import { useExerciseChart } from "@/features/charts/hooks/useExerciseChart";
import { toDisplayWeight } from "@/lib/units";

type ExerciseProgressChartProps = {
  exerciseId: string;
  weightUnit: WeightUnit;
};

type Metric = "weight" | "volume";

export function ExerciseProgressChart({
  exerciseId,
  weightUnit,
}: ExerciseProgressChartProps) {
  const { data, isLoading } = useExerciseChart(exerciseId);
  const [metric, setMetric] = useState<Metric>("weight");

  if (isLoading) return null;

  const series = data ?? [];
  const points = series.map((point) => ({
    t: point.t,
    value: Number(
      toDisplayWeight(
        metric === "weight" ? point.maxWeightKg : point.sessionVolumeKg,
        weightUnit,
      ).toFixed(1),
    ),
  }));

  return (
    <View className="gap-3">
      <Tabs value={metric} onValueChange={(value) => setMetric(value as Metric)}>
        <TabsList className="w-full">
          <TabsTrigger value="weight" className="flex-1">
            <Text>Max weight</Text>
          </TabsTrigger>
          <TabsTrigger value="volume" className="flex-1">
            <Text>Volume</Text>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <ProgressLineChart
        points={points}
        emptyMessage="Log at least two sessions with this exercise to see progress."
        formatY={(value) => `${Math.round(value)}`}
      />
      <Text variant="muted" className="text-center text-xs">
        {`${metric === "weight" ? "Heaviest set" : "Session volume"} · ${weightUnit} · last 3 months`}
      </Text>
    </View>
  );
}
