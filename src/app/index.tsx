import { Redirect, type Href } from "expo-router";
import { useEffect, useState } from "react";

import { CustomScreen } from "@/components/common";
import { initializeDatabase } from "@/db/init";
import { getProfile } from "@/features/profile/repositories/profileRepository";

/** Valid routes; typed routes union updates after `expo start` generates `.expo/types`. */
const HOME = "/(tabs)/home" as Href;
const ONBOARDING = "/onboarding" as Href;

export default function Index() {
  const [destination, setDestination] = useState<Href | null>(null);

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
    return <CustomScreen>{null}</CustomScreen>;
  }

  return <Redirect href={destination} />;
}
