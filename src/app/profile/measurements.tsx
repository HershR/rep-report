import { useQueries } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { View } from "react-native";

import { CustomScreen, ListRow, ScreenHeader } from "@/components/common";
import { getLatestMeasurementByType } from "@/features/measurements/repositories/measurementRepository";
import { BODY_MEASUREMENT_TYPES, MEASUREMENT_LABELS } from "@/features/measurements/types";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { lengthToText } from "@/lib/units";

export default function BodyMeasurementsScreen() {
  const router = useRouter();
  const { heightUnit } = useAppSettings();

  const queries = useQueries({
    queries: BODY_MEASUREMENT_TYPES.map((type) => ({
      queryKey: ["latest-measurement", type],
      queryFn: () => getLatestMeasurementByType(type),
    })),
  });

  return (
    <CustomScreen scroll contentContainerStyle={{ gap: 16 }}>
      <ScreenHeader title="Body measurements" />

      <View>
        {BODY_MEASUREMENT_TYPES.map((type, index) => {
          const latest = queries[index]?.data;
          const valueText = latest
            ? `${lengthToText(latest.value, heightUnit)} ${heightUnit}`
            : "—";
          return (
            <ListRow
              key={type}
              label={MEASUREMENT_LABELS[type]}
              value={valueText}
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
