import { Redirect, type Href } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";

import { CustomScreen, ErrorState, LoadingState } from "@/components/common";
import { Text } from "@/components/ui/text";
import { initializeDatabase } from "@/db/init";
import { getProfile } from "@/features/profile/repositories/profileRepository";

/** Valid routes; typed routes union updates after `expo start` generates `.expo/types`. */
const HOME = "/(tabs)/home" as Href;
const ONBOARDING = "/onboarding" as Href;

type LaunchState =
  | { kind: "loading" }
  | { kind: "ready"; destination: Href }
  | { kind: "failed"; message: string };

export default function Index() {
  const [state, setState] = useState<LaunchState>({ kind: "loading" });

  const launch = useCallback(async (isCancelled: () => boolean) => {
    setState({ kind: "loading" });
    try {
      await initializeDatabase();
      const profile = await getProfile();
      if (isCancelled()) return;
      setState({ kind: "ready", destination: profile ? HOME : ONBOARDING });
    } catch (error) {
      console.error("Launch failed", error);
      if (isCancelled()) return;
      setState({
        kind: "failed",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void launch(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [launch]);

  if (state.kind === "ready") return <Redirect href={state.destination} />;

  return (
    <CustomScreen>
      <View className="flex-1 items-center justify-center">
        <Text variant="screenTitle">Rep Report</Text>
        {state.kind === "loading" ? (
          <LoadingState />
        ) : (
          // Without this the app sat on the spinner forever when a migration
          // failed; now it says so and can retry, since initializeDatabase no
          // longer caches the failure.
          <ErrorState
            title="Couldn't open your data"
            message={state.message}
            onRetry={() => void launch(() => false)}
          />
        )}
      </View>
    </CustomScreen>
  );
}
