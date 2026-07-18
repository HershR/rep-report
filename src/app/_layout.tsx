import "@/global.css";

import { ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
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
  const { colorScheme: scheme } = useColorScheme();
  const colors = THEME[scheme ?? "light"];

  useEffect(() => {
    initializeDatabase().catch((error) => {
      console.error("DB init failed", error);
    });
  }, []);
  useDrizzleStudio(sqlite);
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
            />
            <PortalHost />
            <Toaster theme={scheme ?? "light"} position="top-center" />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
