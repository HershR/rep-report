import { useQueries } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { View } from "react-native";

import { CustomScreen, ScreenHeader } from "@/components/common";
import { MeasurementSummaryCard } from "@/features/measurements/components/MeasurementSummaryCard";
import { getLatestMeasurementByType } from "@/features/measurements/repositories/measurementRepository";
import { BODY_MEASUREMENT_TYPES, MEASUREMENT_LABELS } from "@/features/measurements/types";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { lengthToText, toMetricHeight } from "@/lib/units";

export default function BodyMeasurementsScreen() {
  const router = useRouter();
  const { appSettings } = useAppSettings();
  const heightUnit = appSettings?.heightUnit ?? "cm";

  const queries = useQueries({
    queries: BODY_MEASUREMENT_TYPES.map((type) => ({
      queryKey: ["latest-measurement", type],
      queryFn: () => getLatestMeasurementByType(type),
    })),
  });

  return (
    <CustomScreen scroll contentContainerStyle={{ gap: 16 }}>
      <ScreenHeader title="Body Measurements" showBack />

      <View className="gap-2">
        {BODY_MEASUREMENT_TYPES.map((type, index) => {
          const latest = queries[index]?.data;
          const valueText = latest
            ? `${lengthToText(toMetricHeight(latest.value, latest.unit), heightUnit)} ${heightUnit}`
            : "—";
          return (
            <MeasurementSummaryCard
              key={type}
              label={MEASUREMENT_LABELS[type]}
              valueText={valueText}
              onPress={() =>
                router.push({
                  pathname: "/profile/measurements/[type]",
                  params: { type },
                })
              }
            />
          );
        })}
      </View>
    </CustomScreen>
  );
}
