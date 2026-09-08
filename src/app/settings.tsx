import { useColorScheme } from "nativewind";
import { Switch, View } from "react-native";
import { toast } from "sonner-native";

import { CustomScreen, ScreenHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import type { ThemeMode } from "@/db/schema";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { THEME } from "@/lib/theme";

const THEME_OPTIONS = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
] as const satisfies readonly { label: string; value: ThemeMode }[];

const UNIT_SYSTEM_OPTIONS = [
  { label: "Metric", value: "metric" },
  { label: "Imperial", value: "imperial" },
] as const;

const REST_TIMER_PRESETS = [
  { label: "60s", value: 60 },
  { label: "90s", value: 90 },
  { label: "2m", value: 120 },
  { label: "3m", value: 180 },
] as const;

type UnitSystem = (typeof UNIT_SYSTEM_OPTIONS)[number]["value"];

/**
 * Row of mutually exclusive choices. Replaces the previous mix of `Tabs` and a
 * bare button row so every "pick one of N" setting on this screen looks and
 * announces the same way.
 */
function SegmentedControl<T extends string | number>({
  label,
  options,
  value,
  onSelect,
  disabled = false,
}: {
  label: string;
  options: readonly { label: string; value: T }[];
  value: T;
  onSelect: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <View className="gap-2">
      <Label>{label}</Label>
      <View className="flex-row gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Button
              key={String(option.value)}
              className="flex-1"
              size="sm"
              variant={selected ? "default" : "outline"}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityLabel={`${label}: ${option.label}`}
              accessibilityState={{ selected, disabled }}
              onPress={() => onSelect(option.value)}
            >
              <Text>{option.label}</Text>
            </Button>
          );
        })}
      </View>
    </View>
  );
}

function SettingsSkeleton() {
  return (
    <>
      <Skeleton className="h-5 w-24" />
      <Card>
        <CardContent className="gap-6 pt-6">
          <View className="gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full rounded-md" />
          </View>
          <View className="gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full rounded-md" />
          </View>
        </CardContent>
      </Card>

      <Skeleton className="h-5 w-28" />
      <Card>
        <CardContent className="gap-6 pt-6">
          <Skeleton className="h-8 w-full" />
          <View className="gap-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-9 w-full rounded-md" />
          </View>
        </CardContent>
      </Card>
    </>
  );
}

export default function SettingsScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const colors = THEME[colorScheme ?? "light"];
  const { appSettings, isLoading, error, refetch, updateAppSettings } =
    useAppSettings();

  const themeMode: ThemeMode = appSettings?.themeMode ?? "system";
  const unitSystem: UnitSystem =
    appSettings?.heightUnit === "in" ? "imperial" : "metric";
  const restTimerEnabled = (appSettings?.restTimerEnabled ?? 1) === 1;
  const restTimerDefaultSeconds = appSettings?.restTimerDefaultSeconds ?? 90;

  /** Writes are fire-and-forget from the UI's view, so surface failures here. */
  const persist = async (
    input: Parameters<typeof updateAppSettings>[0],
    failureMessage: string,
    onFailure?: () => void,
  ) => {
    try {
      await updateAppSettings(input);
    } catch {
      onFailure?.();
      toast.error(failureMessage);
    }
  };

  const onSelectTheme = (mode: ThemeMode) => {
    const previous = themeMode;
    // Apply immediately so the change feels instant, then roll back if it fails
    // to save (ThemeModeSync in _layout re-applies from settings either way).
    setColorScheme(mode);
    void persist({ themeMode: mode }, "Could not save appearance.", () =>
      setColorScheme(previous),
    );
  };

  const onSelectUnitSystem = (system: UnitSystem) => {
    const units =
      system === "metric"
        ? ({ weightUnit: "kg", heightUnit: "cm", distanceUnit: "km" } as const)
        : ({ weightUnit: "lb", heightUnit: "in", distanceUnit: "mi" } as const);
    void persist(units, "Could not save unit system.");
  };

  return (
    <CustomScreen scroll contentContainerStyle={{ gap: 16 }}>
      <ScreenHeader title="Settings" showBack />

      {error ? (
        <Card>
          <CardContent className="gap-3 pt-6">
            <Text className="text-destructive text-sm">
              Could not load your settings.
            </Text>
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              onPress={() => void refetch()}
            >
              <Text>Retry</Text>
            </Button>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <SettingsSkeleton />
      ) : (
        <>
          <Text variant="large">General</Text>
          <Card>
            <CardContent className="gap-6 pt-6">
              <SegmentedControl
                label="Unit system"
                options={UNIT_SYSTEM_OPTIONS}
                value={unitSystem}
                onSelect={onSelectUnitSystem}
              />
              <SegmentedControl
                label="Theme"
                options={THEME_OPTIONS}
                value={themeMode}
                onSelect={onSelectTheme}
              />
            </CardContent>
          </Card>

          <Text variant="large">Rest timer</Text>
          <Card>
            <CardContent className="gap-6 pt-6">
              <View className="flex-row items-center justify-between">
                <Label>Start a timer between sets</Label>
                <Switch
                  value={restTimerEnabled}
                  accessibilityLabel="Start a timer between sets"
                  onValueChange={(on) =>
                    void persist(
                      { restTimerEnabled: on ? 1 : 0 },
                      "Could not save rest timer setting.",
                    )
                  }
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <SegmentedControl
                label="Default rest duration"
                options={REST_TIMER_PRESETS}
                value={restTimerDefaultSeconds}
                disabled={!restTimerEnabled}
                onSelect={(seconds) =>
                  void persist(
                    { restTimerDefaultSeconds: seconds },
                    "Could not save rest duration.",
                  )
                }
              />
            </CardContent>
          </Card>
        </>
      )}
    </CustomScreen>
  );
}
