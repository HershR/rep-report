import { format } from "date-fns";
import { useState } from "react";
import { View } from "react-native";

import { CustomScreen, ScreenHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import type { WeightUnit } from "@/db/schema";
import { useMeasurements } from "@/features/measurements/hooks/useMeasurements";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { toMetricWeight, weightToText } from "@/lib/units";

export default function WeightHistoryScreen() {
  const { appSettings } = useAppSettings();
  const weightUnit = appSettings?.weightUnit ?? "kg";
  const {
    history,
    addMeasurement: addWeight,
    isLoading,
    error,
    refetch,
  } = useMeasurements("weight");
  const [weightValue, setWeightValue] = useState("");

  const onAddWeight = async () => {
    const value = Number(weightValue.trim());
    if (!Number.isFinite(value) || value <= 0) return;
    const metricValue = toMetricWeight(value, weightUnit);
    await addWeight({ value: metricValue, unit: "kg" });
    setWeightValue("");
  };

  const displayText = (valueInKg: number) =>
    `${weightToText(valueInKg, weightUnit)} ${weightUnit}`;

  return (
    <CustomScreen scroll contentContainerStyle={{ gap: 16 }}>
      <ScreenHeader title="Weight" />

      <View className="flex-row items-center gap-2">
        <Input
          className="flex-1"
          value={weightValue}
          onChangeText={setWeightValue}
          placeholder={`Weight (${weightUnit})`}
          keyboardType="decimal-pad"
        />
        <Button onPress={() => void onAddWeight()}>
          <Text>Add</Text>
        </Button>
      </View>

      {isLoading ? (
        <View className="gap-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </View>
      ) : error ? (
        <View className="gap-2">
          <Text className="text-destructive text-sm">
            Couldn&apos;t load weight history.
          </Text>
          <Button variant="outline" size="sm" onPress={refetch}>
            <Text>Retry</Text>
          </Button>
        </View>
      ) : history.length === 0 ? (
        <Text variant="muted">No weight entries yet.</Text>
      ) : (
        <View className="gap-2">
          {history
            .slice()
            .reverse()
            .map((item) => (
              <Card
                key={item.id}
                className="flex-row items-center justify-between px-4 py-3"
              >
                <Text variant="muted">
                  {format(new Date(item.measuredAt), "PP")}
                </Text>
                <Text>
                  {displayText(
                    toMetricWeight(item.value, item.unit as WeightUnit),
                  )}
                </Text>
              </Card>
            ))}
        </View>
      )}
    </CustomScreen>
  );
}
