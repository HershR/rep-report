import { Redirect, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";

import { CustomScreen } from "@/components/common";
import { Text } from "@/components/ui/text";
import { initializeDatabase } from "@/db/init";
import { getProfile } from "@/features/profile/repositories/profileRepository";
import { THEME } from "@/lib/theme";

/** Valid routes; typed routes union updates after `expo start` generates `.expo/types`. */
const HOME = "/(tabs)/home" as Href;
const ONBOARDING = "/onboarding" as Href;

export default function Index() {
  const [destination, setDestination] = useState<Href | null>(null);
  const scheme = useColorScheme();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await initializeDatabase();
      const profile = await getProfile();
      if (cancelled) return;
      setDestination(profile ? HOME : ONBOARDING);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!destination) {
    return (
      <CustomScreen>
        <View className="flex-1 items-center justify-center gap-4">
          <Text variant="h3">Rep Report</Text>
          <ActivityIndicator color={THEME[scheme ?? "light"].primary} />
        </View>
      </CustomScreen>
    );
  }

  return <Redirect href={destination} />;
}
