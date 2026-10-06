import { format } from "date-fns";
import { useState } from "react";
import { View } from "react-native";

import { CustomScreen, ScreenHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { MeasurementHistoryList } from "@/features/measurements/components/MeasurementHistoryList";
import { useMeasurements } from "@/features/measurements/hooks/useMeasurements";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { toDisplayHeightCm, toMetricHeight } from "@/lib/units";

export default function HeightHistoryScreen() {
  const { heightUnit } = useAppSettings();
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
      await addHeight({ value: toMetricHeight(totalInches, "in") });
      setHeightFeet("");
      setHeightInches("");
      return;
    }

    const value = Number(heightValue.trim());
    if (!Number.isFinite(value) || value <= 0) return;
    await addHeight({ value });
    setHeightValue("");
  };

  return (
    <CustomScreen scroll contentContainerStyle={{ gap: 16 }}>
      <ScreenHeader title="Height" />

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

      <Text variant="sectionLabel">HISTORY</Text>
      <MeasurementHistoryList
        isLoading={isLoading}
        error={error}
        rows={history
          .slice()
          .reverse()
          .map((item) => ({
            id: item.id,
            dateText: format(new Date(item.measuredAt), "PP"),
            valueText: toDisplayHeightCm(item.value, heightUnit),
          }))}
        emptyMessage="No height entries yet."
        errorMessage="Couldn't load height history"
        onRetry={refetch}
      />
    </CustomScreen>
  );
}
