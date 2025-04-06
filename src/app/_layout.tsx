import { Stack } from "expo-router";
import "../global.css";
import { ActivityIndicator, StatusBar } from "react-native";
import { DateProvider } from "../context/DateContext";
import { Suspense } from "react";
import { SQLiteProvider, openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/drizzle/migrations";

export const DATABASE_NAME = "workouts";

export default function RootLayout() {
  const expoDb = openDatabaseSync(DATABASE_NAME);
  const db = drizzle(expoDb);
  const { success, error } = useMigrations(db, migrations);
  return (
    <>
      <Suspense fallback={<ActivityIndicator size="large" />}>
        <SQLiteProvider
          databaseName={DATABASE_NAME}
          options={{ enableChangeListener: true }}
          useSuspense
        >
          <DateProvider>
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
            </Stack>
          </DateProvider>
        </SQLiteProvider>
      </Suspense>
    </>
  );
}
