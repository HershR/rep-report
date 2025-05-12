import "../global.css";
import { Stack } from "expo-router";
import { StatusBar, View, Text } from "react-native";
import { DateProvider } from "../context/DateContext";
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { SQLiteProvider, openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/drizzle/migrations";
import {
  Theme,
  ThemeProvider,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { Platform } from "react-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { PortalHost } from "@rn-primitives/portal";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ActivityLoader from "../components/ActivityLoader";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { DATABASE_NAME, db, expo_sqlite } from "@/src/db/client";
const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
export const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export default function RootLayout() {
  //db
  const { success, error } = useMigrations(db, migrations);
  useDrizzleStudio(expo_sqlite);
  //rnr ui lib
  const hasMounted = useRef(false);
  const { colorScheme, isDarkColorScheme, setColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false);
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const savedTheme = await AsyncStorage.getItem("theme");
    if (savedTheme === null) {
      await AsyncStorage.setItem("theme", colorScheme);
    } else {
      setColorScheme(savedTheme === "dark" ? "dark" : "light"); // Default to system if no saved theme
    }
  };
  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === "web") {
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add("bg-background");
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  if (error) {
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }
  if (!success) {
    return (
      <View>
        <Text>Migration is in progress...</Text>
      </View>
    );
  }
  if (!isColorSchemeLoaded) {
    return null;
  }
  return (
    <>
      <Suspense fallback={<ActivityLoader />}>
        <SQLiteProvider
          databaseName={DATABASE_NAME}
          options={{ enableChangeListener: true }}
          useSuspense
        >
          <DateProvider>
            <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
              <StatusBar hidden={true} />
              <Stack>
                <Stack.Screen
                  name="(tabs)"
                  options={{ headerShown: false }}
                ></Stack.Screen>
                <Stack.Screen
                  name="exercise/[id]"
                  options={{ headerShown: false }}
                ></Stack.Screen>
                <Stack.Screen
                  name="workout/create/[id]"
                  options={{ headerShown: false }}
                ></Stack.Screen>
                <Stack.Screen
                  name="workout/update/[id]"
                  options={{ headerShown: false }}
                ></Stack.Screen>
                <Stack.Screen
                  name="routine/create"
                  options={{ headerShown: false }}
                ></Stack.Screen>
                <Stack.Screen
                  name="routine/[id]"
                  options={{ headerShown: false }}
                ></Stack.Screen>
                <Stack.Screen
                  name="routine/update/[id]"
                  options={{ headerShown: false }}
                ></Stack.Screen>
              </Stack>
              <PortalHost />
              <Toast />
            </ThemeProvider>
          </DateProvider>
        </SQLiteProvider>
      </Suspense>
    </>
  );
}
const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? useEffect
    : useLayoutEffect;
