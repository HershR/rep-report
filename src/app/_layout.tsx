import '@/global.css';
import { DateProvider } from '@/hooks/DateContext';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Suspense } from 'react';
import { ActivityIndicator } from 'react-native';
import { useUniwind } from 'uniwind';
import migrations from '../../drizzle/migrations';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';
const DATABASE_NAME = 'db.db';
export default function RootLayout() {
  const expo = SQLite.openDatabaseSync(DATABASE_NAME);
  const db = drizzle(expo);
  const { theme } = useUniwind();
  const { success, error } = useMigrations(db, migrations);
  // if (error) {
  //   return (
  //     <View>
  //       <Text>Migration error: {error.message}</Text>
  //     </View>
  //   );
  // }
  // if (!success) {
  //   return (
  //     <View>
  //       <Text>Migration is in progress...</Text>
  //     </View>
  //   );
  // }
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        options={{ enableChangeListener: true }}
        useSuspense>
        <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
          <DateProvider>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <PortalHost />
          </DateProvider>
        </ThemeProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
