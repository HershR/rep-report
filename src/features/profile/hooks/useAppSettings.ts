import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { DistanceUnit, HeightUnit, WeightUnit } from "@/db/schema";
import {
  getAppSettings,
  updateAppSettings,
} from "@/features/profile/repositories/appSettingsRepository";

/**
 * What every screen shows before settings have loaded. Matches the seeded
 * defaults (`src/db/seed.ts`), so the first frame never disagrees with the
 * second - screens used to fall back to "kg" in some places and "lb" in others.
 */
const DEFAULTS = {
  weightUnit: "lb" as WeightUnit,
  heightUnit: "in" as HeightUnit,
  distanceUnit: "mi" as DistanceUnit,
  restTimerEnabled: true,
  restTimerDefaultSeconds: 90,
};

export function useAppSettings() {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({
    queryKey: ["app-settings"],
    queryFn: getAppSettings,
  });

  const updateMutation = useMutation({
    mutationFn: updateAppSettings,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["app-settings"] });
    },
  });

  const settings = settingsQuery.data;
  return {
    appSettings: settings ?? null,
    weightUnit: settings?.weightUnit ?? DEFAULTS.weightUnit,
    heightUnit: settings?.heightUnit ?? DEFAULTS.heightUnit,
    distanceUnit: settings?.distanceUnit ?? DEFAULTS.distanceUnit,
    restTimerEnabled: settings ? settings.restTimerEnabled === 1 : DEFAULTS.restTimerEnabled,
    restTimerDefaultSeconds: settings?.restTimerDefaultSeconds ?? DEFAULTS.restTimerDefaultSeconds,
    isLoading: settingsQuery.isLoading,
    error: settingsQuery.error ?? null,
    refetch: settingsQuery.refetch,
    updateAppSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
