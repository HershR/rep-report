import { format } from "date-fns";
import { useState } from "react";
import { View } from "react-native";

import { CustomScreen, ScreenHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useMeasurements } from "@/features/measurements/hooks/useMeasurements";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { toDisplayHeightCm, toMetricHeight } from "@/lib/units";

export default function HeightHistoryScreen() {
  const { appSettings } = useAppSettings();
  const heightUnit = appSettings?.heightUnit ?? "cm";
  const {
    history,
    addMeasurement: addHeight,
    isLoading,
    error,
    refetch,
  } = useMeasurements("height");
  const [heightValue, setHeightValue] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");

  const onAddHeight = async () => {
    if (heightUnit === "in") {
      const feet = Number(heightFeet.trim() || "0");
      const inches = Number(heightInches.trim() || "0");
      if (!Number.isFinite(feet) || !Number.isFinite(inches)) return;
      if (feet < 0 || inches < 0) return;
      const totalInches = feet * 12 + inches;
      if (totalInches <= 0) return;
      await addHeight({ value: toMetricHeight(totalInches, "in"), unit: "cm" });
      setHeightFeet("");
      setHeightInches("");
      return;
    }

    const value = Number(heightValue.trim());
    if (!Number.isFinite(value) || value <= 0) return;
    await addHeight({ value: toMetricHeight(value, "cm"), unit: "cm" });
    setHeightValue("");
  };

  return (
    <CustomScreen scroll contentContainerStyle={{ gap: 16 }}>
      <ScreenHeader title="Height" showBack />

      <View className="flex-row items-center gap-2">
        {heightUnit === "in" ? (
          <>
            <Input
              className="flex-1"
              value={heightFeet}
              onChangeText={setHeightFeet}
              placeholder="Feet"
              keyboardType="number-pad"
            />
            <Input
              className="flex-1"
              value={heightInches}
              onChangeText={setHeightInches}
              placeholder="Inches"
              keyboardType="number-pad"
            />
          </>
        ) : (
          <Input
            className="flex-1"
            value={heightValue}
            onChangeText={setHeightValue}
            placeholder="Height (cm)"
            keyboardType="decimal-pad"
          />
        )}
        <Button onPress={() => void onAddHeight()}>
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
            Couldn&apos;t load height history.
          </Text>
          <Button variant="outline" size="sm" onPress={refetch}>
            <Text>Retry</Text>
          </Button>
        </View>
      ) : history.length === 0 ? (
        <Text variant="muted">No height entries yet.</Text>
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
                  {toDisplayHeightCm(
                    toMetricHeight(item.value, item.unit),
                    heightUnit,
                  )}
                </Text>
              </Card>
            ))}
        </View>
      )}
    </CustomScreen>
  );
}
