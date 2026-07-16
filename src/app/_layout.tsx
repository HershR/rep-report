import "@/global.css";

import { ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { initializeDatabase } from "@/db/init";
import { NAV_THEME, THEME } from "@/lib/theme";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { sqlite } from "@/db/client";
export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const scheme = useColorScheme();
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
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
