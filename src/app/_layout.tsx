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
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { NAV_THEME, THEME } from "@/lib/theme";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { sqlite } from "@/db/client";

SplashScreen.preventAutoHideAsync().catch(() => {
  // already hidden; nothing to do
});

/**
 * Applies the persisted theme preference (`appSettings.themeMode`) to NativeWind's
 * color scheme so the choice survives app restarts. Lives inside QueryClientProvider
 * because it reads a react-query-backed hook. NativeWind's color scheme is the single
 * source of truth for both `className` dark variants and the JS `THEME[scheme]` lookups.
 */
function ThemeModeSync() {
  const { appSettings } = useAppSettings();
  const { setColorScheme } = useColorScheme();
  const themeMode = appSettings?.themeMode;

  useEffect(() => {
    if (themeMode) setColorScheme(themeMode);
  }, [themeMode, setColorScheme]);

  return null;
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [fontsLoaded, fontError] = useFonts({
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    Archivo_700Bold,
    Archivo_800ExtraBold,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });
  const { colorScheme: scheme } = useColorScheme();
  const colors = THEME[scheme ?? "light"];

  useEffect(() => {
    initializeDatabase().catch((error) => {
      console.error("DB init failed", error);
    });
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
          <ThemeModeSync />
          <ThemeProvider value={NAV_THEME[scheme ?? "light"]}>
            <StatusBar style={scheme === "dark" ? "light" : "dark"} />
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
            <Toaster theme={scheme ?? "light"} position="top-center" />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
