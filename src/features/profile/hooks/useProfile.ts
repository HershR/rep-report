import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getProfile, upsertProfile } from "@/features/profile/repositories/profileRepository";

export function useProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const saveProfileMutation = useMutation({
    mutationFn: (input: { displayName: string; dateOfBirth?: string | null }) =>
      upsertProfile(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return {
    profile: profileQuery.data ?? null,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error ?? null,
    refetch: profileQuery.refetch,
    saveProfile: saveProfileMutation.mutateAsync,
    isSaving: saveProfileMutation.isPending,
  };
}
