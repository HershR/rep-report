import { Switch, View } from "react-native";

import { CustomScreen, ScreenHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { THEME } from "@/lib/theme";

const REST_TIMER_PRESETS = [
  { label: "60s", value: 60 },
  { label: "90s", value: 90 },
  { label: "2m", value: 120 },
  { label: "3m", value: 180 },
] as const;

export default function SettingsScreen() {
  const colors = THEME;
  const { appSettings, updateAppSettings } = useAppSettings();

  const restTimerEnabled = (appSettings?.restTimerEnabled ?? 1) === 1;
  const restTimerDefaultSeconds = appSettings?.restTimerDefaultSeconds ?? 90;

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
        </CardContent>
      </Card>

      <Card>
        <CardContent className="gap-6 pt-6">
          <View className="flex-row items-center justify-between">
            <Label>Rest timer</Label>
            <Switch
              value={restTimerEnabled}
              onValueChange={(on) =>
                void updateAppSettings({ restTimerEnabled: on ? 1 : 0 })
              }
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View className="gap-2">
            <Label>Default rest duration</Label>
            <View className="flex-row gap-2">
              {REST_TIMER_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  className="flex-1"
                  size="sm"
                  variant={
                    restTimerDefaultSeconds === preset.value
                      ? "default"
                      : "outline"
                  }
                  onPress={() =>
                    void updateAppSettings({
                      restTimerDefaultSeconds: preset.value,
                    })
                  }
                >
                  <Text>{preset.label}</Text>
                </Button>
              ))}
            </View>
          </View>
        </CardContent>
      </Card>
    </CustomScreen>
  );
}
