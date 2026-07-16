import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createMeasurement,
  getLatestMeasurementByType,
  listMeasurements,
  type SupportedMeasurementType,
} from "@/features/measurements/repositories/measurementRepository";

function keyForType(type: SupportedMeasurementType) {
  return ["measurements", type] as const;
}

export function useMeasurements(type: SupportedMeasurementType) {
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: keyForType(type),
    queryFn: () => listMeasurements(type),
  });

  const latestQuery = useQuery({
    queryKey: ["latest-measurement", type],
    queryFn: () => getLatestMeasurementByType(type),
  });

  const addMeasurementMutation = useMutation({
    mutationFn: (input: { value: number; unit: string; measuredAt?: string; notes?: string | null }) =>
      createMeasurement({
        measurementType: type,
        value: input.value,
        unit: input.unit,
        measuredAt: input.measuredAt,
        notes: input.notes ?? null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keyForType(type) });
      void queryClient.invalidateQueries({ queryKey: ["latest-measurement", type] });
    },
  });

  return {
    history: historyQuery.data ?? [],
    latest: latestQuery.data ?? null,
    isLoading: historyQuery.isLoading || latestQuery.isLoading,
    error: historyQuery.error ?? latestQuery.error ?? null,
    refetch: () => {
      void historyQuery.refetch();
      void latestQuery.refetch();
    },
    addMeasurement: addMeasurementMutation.mutateAsync,
    isAdding: addMeasurementMutation.isPending,
  };
}
