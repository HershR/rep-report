import { useState } from "react";
import { View } from "react-native";

import { EmptyState, ErrorState, LoadingState } from "@/components/common";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import type { WeightUnit } from "@/db/schema";
import { ProgressLineChart } from "@/features/charts/components/ProgressLineChart";
import { useExerciseChart } from "@/features/charts/hooks/useExerciseChart";
import { toDisplayWeight } from "@/lib/units";

type ExerciseProgressChartProps = {
  exerciseId: string;
  weightUnit: WeightUnit;
  /** Cardio is excluded from strength progress, so there is nothing to chart. */
  isCardio?: boolean;
};

type Metric = "weight" | "volume" | "e1rm";

const METRIC_LABEL: Record<Metric, string> = {
  weight: "Heaviest set",
  volume: "Session volume",
  e1rm: "Estimated 1RM",
};

export function ExerciseProgressChart({
  exerciseId,
  weightUnit,
  isCardio = false,
}: ExerciseProgressChartProps) {
  const { data, isLoading, isError, refetch } = useExerciseChart(exerciseId);
  const [metric, setMetric] = useState<Metric>("weight");

  if (isCardio) {
    return <EmptyState message="Progress charts track strength work, so cardio isn't charted." />;
  }
  if (isLoading) return <LoadingState />;
  if (isError) {
    return <ErrorState title="Couldn't load this chart" onRetry={() => void refetch()} />;
  }

  const series = data ?? [];
  const points = series.map((point) => {
    const raw =
      metric === "weight"
        ? point.maxWeightKg
        : metric === "volume"
          ? point.sessionVolumeKg
          : point.maxEpleyKg;
    return {
      t: point.t,
      value: Number(toDisplayWeight(raw, weightUnit).toFixed(1)),
    };
  });

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
          <TabsTrigger value="e1rm" className="flex-1">
            <Text>Est. 1RM</Text>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <ProgressLineChart
        points={points}
        emptyMessage="Log at least two sessions with this exercise to see progress."
        formatY={(value) => `${Math.round(value)}`}
      />
      <Text variant="meta" className="text-text-3 text-center">
        {`${METRIC_LABEL[metric]} · ${weightUnit} · last 3 months`.toUpperCase()}
      </Text>
    </View>
  );
}
