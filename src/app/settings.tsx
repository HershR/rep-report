import { useColorScheme } from "nativewind";
import { Switch, View } from "react-native";

import { CustomScreen, ScreenHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { THEME } from "@/lib/theme";

export default function SettingsScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const colors = THEME[colorScheme ?? "light"];
  const { appSettings, updateAppSettings } = useAppSettings();

  const onToggleDarkMode = (dark: boolean) => {
    const mode = dark ? "dark" : "light";
    setColorScheme(mode);
    void updateAppSettings({ themeMode: mode });
  };

  const onSwitchUnitSystem = async (system: "metric" | "imperial") => {
    if (system === "metric") {
      await updateAppSettings({
        weightUnit: "kg",
        heightUnit: "cm",
        distanceUnit: "km",
      });
      return;
    }
    await updateAppSettings({
      weightUnit: "lb",
      heightUnit: "in",
      distanceUnit: "mi",
    });
  };

  return (
    <CustomScreen scroll contentContainerStyle={{ gap: 16 }}>
      <ScreenHeader title="Settings" />

      <Card>
        <CardContent className="gap-6 pt-6">
          <View className="gap-2">
            <Label>Unit system</Label>
            <Tabs
              value={appSettings?.heightUnit === "in" ? "imperial" : "metric"}
              onValueChange={(value) =>
                void onSwitchUnitSystem(value as "metric" | "imperial")
              }
            >
              <TabsList className="w-full">
                <TabsTrigger value="metric" className="flex-1">
                  <Text>Metric</Text>
                </TabsTrigger>
                <TabsTrigger value="imperial" className="flex-1">
                  <Text>Imperial</Text>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="metric" />
              <TabsContent value="imperial" />
            </Tabs>
          </View>

          <View className="flex-row items-center justify-between">
            <Label>Dark mode</Label>
            <Switch
              value={colorScheme === "dark"}
              onValueChange={onToggleDarkMode}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </CardContent>
      </Card>
    </CustomScreen>
  );
}
