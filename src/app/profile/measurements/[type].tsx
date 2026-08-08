import { format } from "date-fns";
import { useLocalSearchParams } from "expo-router";

import { CustomScreen, ScreenHeader } from "@/components/common";
import { MeasurementEntryForm } from "@/features/measurements/components/MeasurementEntryForm";
import { MeasurementHistoryList } from "@/features/measurements/components/MeasurementHistoryList";
import { useMeasurements } from "@/features/measurements/hooks/useMeasurements";
import type { SupportedMeasurementType } from "@/features/measurements/repositories/measurementRepository";
import { MEASUREMENT_LABELS } from "@/features/measurements/types";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { lengthToText, textToMetricLength, toMetricHeight } from "@/lib/units";

export default function BodyMeasurementTypeScreen() {
  const params = useLocalSearchParams<{ type: string }>();
  const type = params.type as SupportedMeasurementType;
  const label = MEASUREMENT_LABELS[type] ?? params.type;

  const { appSettings } = useAppSettings();
  const heightUnit = appSettings?.heightUnit ?? "cm";
  const {
    history,
    addMeasurement,
    isAdding,
    isLoading,
    error,
    refetch,
  } = useMeasurements(type);

  const onAdd = async (rawText: string) => {
    const metricValue = textToMetricLength(rawText, heightUnit);
    if (metricValue === null || metricValue <= 0) return;
    await addMeasurement({ value: metricValue, unit: "cm" });
  };

  const rows = history
    .slice()
    .reverse()
    .map((item) => ({
      id: item.id,
      dateText: format(new Date(item.measuredAt), "PP"),
      valueText: `${lengthToText(toMetricHeight(item.value, item.unit), heightUnit)} ${heightUnit}`,
    }));

  return (
    <CustomScreen scroll contentContainerStyle={{ gap: 16 }}>
      <ScreenHeader title={label} showBack />

      <MeasurementEntryForm
        placeholder={`${label} (${heightUnit})`}
        isAdding={isAdding}
        onAdd={(rawText) => void onAdd(rawText)}
      />

      <MeasurementHistoryList
        isLoading={isLoading}
        error={error}
        rows={rows}
        emptyMessage={`No ${label.toLowerCase()} entries yet.`}
        errorMessage={`Couldn't load ${label.toLowerCase()} history.`}
        onRetry={refetch}
      />
    </CustomScreen>
  );
}
