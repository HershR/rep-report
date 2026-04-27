import { useQuery } from "@tanstack/react-query";

import { getAppSettings } from "@/features/profile/repositories/appSettingsRepository";

export function useAppSettings() {
  const settingsQuery = useQuery({
    queryKey: ["app-settings"],
    queryFn: getAppSettings,
  });

  return {
    appSettings: settingsQuery.data ?? null,
    isLoading: settingsQuery.isLoading,
    error: settingsQuery.error ?? null,
    refetch: settingsQuery.refetch,
  };
}
