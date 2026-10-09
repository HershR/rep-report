import { format } from "date-fns";
import { useLocalSearchParams } from "expo-router";

import { CustomScreen, ScreenHeader } from "@/components/common";
import { Text } from "@/components/ui/text";
import { MeasurementEntryForm } from "@/features/measurements/components/MeasurementEntryForm";
import { MeasurementHistoryList } from "@/features/measurements/components/MeasurementHistoryList";
import { MeasurementTrendChart } from "@/features/measurements/components/MeasurementTrendChart";
import { useMeasurements } from "@/features/measurements/hooks/useMeasurements";
import type { SupportedMeasurementType } from "@/features/measurements/repositories/measurementRepository";
import { MEASUREMENT_LABELS } from "@/features/measurements/types";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { lengthToText, textToMetricLength, toDisplayLengthCm } from "@/lib/units";

export default function BodyMeasurementTypeScreen() {
  const params = useLocalSearchParams<{ type: string }>();
  const type = params.type as SupportedMeasurementType;
  const label = MEASUREMENT_LABELS[type] ?? params.type;

  const { heightUnit } = useAppSettings();
  const { history, addMeasurement, isAdding, isLoading, error, refetch } =
    useMeasurements(type);

  const onAdd = async (rawText: string) => {
    const metricValue = textToMetricLength(rawText, heightUnit);
    if (metricValue === null || metricValue <= 0) return;
    await addMeasurement({ value: metricValue });
  };

  const rows = history
    .slice()
    .reverse()
    .map((item) => ({
      id: item.id,
      dateText: format(new Date(item.measuredAt), "PP"),
      valueText: `${lengthToText(item.value, heightUnit)} ${heightUnit}`,
    }));

  return (
    <CustomScreen scroll contentContainerStyle={{ gap: 16 }}>
      <ScreenHeader title={label} />

      <MeasurementEntryForm
        placeholder={`${label} (${heightUnit})`}
        isAdding={isAdding}
        onAdd={(rawText) => void onAdd(rawText)}
      />

      {history.length > 0 ? (
        <MeasurementTrendChart
          points={history.map((item) => ({
            t: Date.parse(item.measuredAt),
            value: Number(toDisplayLengthCm(item.value, heightUnit).toFixed(1)),
          }))}
          caption={`${label} · ${heightUnit}`.toUpperCase()}
        />
      ) : null}

      <Text variant="sectionLabel">HISTORY</Text>
      <MeasurementHistoryList
        isLoading={isLoading}
        error={error}
        rows={rows}
        emptyMessage={`No ${label.toLowerCase()} entries yet.`}
        errorMessage={`Couldn't load ${label.toLowerCase()} history`}
        onRetry={refetch}
      />
    </CustomScreen>
  );
}
