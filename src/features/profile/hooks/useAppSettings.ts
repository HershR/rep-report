import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAppSettings,
  updateAppSettings,
} from "@/features/profile/repositories/appSettingsRepository";

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

  return {
    appSettings: settingsQuery.data ?? null,
    isLoading: settingsQuery.isLoading,
    error: settingsQuery.error ?? null,
    refetch: settingsQuery.refetch,
    updateAppSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
