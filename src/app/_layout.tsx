import "@/global.css";

import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
} from "@expo-google-fonts/archivo";
import {
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
} from "@expo-google-fonts/ibm-plex-mono";
import { ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PortalHost } from "@rn-primitives/portal";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";

import { initializeDatabase } from "@/db/init";
import { discardOrphanedActiveSessions } from "@/features/workouts/repositories/workoutRepository";
import { NAV_THEME, THEME } from "@/lib/theme";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { sqlite } from "@/db/client";
import { WgerTimeoutError } from "@/services/wger/client";

SplashScreen.preventAutoHideAsync().catch(() => {
  // already hidden; nothing to do
});

/**
 * The app is dark only. NativeWind still needs the scheme pinned so `dark:`
 * variants resolve; the CSS custom properties are dark in :root regardless.
 */
function ForceDarkScheme() {
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme("dark");
  }, [setColorScheme]);

  return null;
}

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Retrying a timeout just multiplies the wait; everything else
            // keeps the default backoff.
            retry: (failureCount, error) =>
              !(error instanceof WgerTimeoutError) && failureCount < 3,
          },
        },
      }),
  );
  const [fontsLoaded, fontError] = useFonts({
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    Archivo_700Bold,
    Archivo_800ExtraBold,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });
  const colors = THEME;

  useEffect(() => {
    void (async () => {
      try {
        await initializeDatabase();
      } catch (error) {
        console.error("DB init failed", error);
        return;
      }

      // Only one workout can be in progress, and only the newest `active` row is
      // ever reachable. Older ones are leftovers a UI bug used to strand here;
      // sweep them so they don't sit in the DB forever.
      try {
        const discarded = await discardOrphanedActiveSessions();
        if (discarded > 0) {
          console.warn(`Discarded ${discarded} unreachable active workout(s)`);
        }
      } catch (error) {
        console.error("Orphaned workout cleanup failed", error);
      }
    })();
  }, []);
  useDrizzleStudio(sqlite);

  // Hold the splash until the faces are ready, so text never paints in the
  // fallback and reflows. A font error still releases it - shipping the
  // system stack beats hanging on the splash.
  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ForceDarkScheme />
          <ThemeProvider value={NAV_THEME}>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.card },
                headerTintColor: colors.foreground,
                headerShadowVisible: false,
                contentStyle: { backgroundColor: colors.background },
                headerShown: false,
              }}
            >
              <Stack.Screen
                name="workout/active"
                options={{ presentation: "modal" }}
              />
            </Stack>
            <PortalHost />
            <Toaster theme="dark" position="top-center" />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
