import { format } from "date-fns";

import { CustomScreen, ScreenHeader } from "@/components/common";
import { Text } from "@/components/ui/text";
import { MeasurementEntryForm } from "@/features/measurements/components/MeasurementEntryForm";
import { MeasurementHistoryList } from "@/features/measurements/components/MeasurementHistoryList";
import { MeasurementTrendChart } from "@/features/measurements/components/MeasurementTrendChart";
import { useMeasurements } from "@/features/measurements/hooks/useMeasurements";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { textToMetricWeight, toDisplayWeight, weightToText } from "@/lib/units";

export default function WeightHistoryScreen() {
  const { weightUnit } = useAppSettings();
  const { history, addMeasurement, isAdding, isLoading, error, refetch } =
    useMeasurements("weight");

  const onAdd = async (rawText: string) => {
    const metricValue = textToMetricWeight(rawText, weightUnit);
    if (metricValue === null || metricValue <= 0) return;
    await addMeasurement({ value: metricValue });
  };

  const rows = history
    .slice()
    .reverse()
    .map((item) => ({
      id: item.id,
      dateText: format(new Date(item.measuredAt), "PP"),
      valueText: `${weightToText(item.value, weightUnit)} ${weightUnit}`,
    }));

  return (
    <CustomScreen scroll contentContainerStyle={{ gap: 16 }}>
      <ScreenHeader title="Weight" />

      <MeasurementEntryForm
        placeholder={`Weight (${weightUnit})`}
        isAdding={isAdding}
        onAdd={(rawText) => void onAdd(rawText)}
      />

      {history.length > 0 ? (
        <MeasurementTrendChart
          points={history.map((item) => ({
            t: Date.parse(item.measuredAt),
            value: Number(toDisplayWeight(item.value, weightUnit).toFixed(1)),
          }))}
          caption={`BODY WEIGHT · ${weightUnit.toUpperCase()}`}
        />
      ) : null}

      <Text variant="sectionLabel">HISTORY</Text>
      <MeasurementHistoryList
        isLoading={isLoading}
        error={error}
        rows={rows}
        emptyMessage="No weight entries yet."
        errorMessage="Couldn't load weight history"
        onRetry={refetch}
      />
    </CustomScreen>
  );
}
