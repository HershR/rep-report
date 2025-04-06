import { Stack } from "expo-router";
import "../global.css";
import { StatusBar } from "react-native";
import { DateProvider } from "../context/DateContext";
export default function RootLayout() {
  return (
    <>
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
    </>
  );
}
