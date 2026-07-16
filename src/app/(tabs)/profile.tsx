import { useEffect, useState } from "react";
import { View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";

import { CustomScreen } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { useMeasurements } from "@/features/measurements/hooks/useMeasurements";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { useProfile } from "@/features/profile/hooks/useProfile";
import type { WeightUnit } from "@/db/schema";
import { toMetricWeight, toDisplayWeight } from "@/lib/units";

function formatDisplayWeight(
  valueInKg: number,
  weightUnit: WeightUnit,
): { value: number; unit: WeightUnit } {
  return { value: Number(toDisplayWeight(valueInKg, weightUnit).toFixed(2)), unit: weightUnit };
}

function toMetricHeight(value: number, unit: string): number {
  if (unit === "in") return value * 2.54;
  return value;
}

function toDisplayHeightCm(valueInCm: number, heightUnit: "cm" | "in"): string {
  if (heightUnit === "in") {
    const totalInches = valueInCm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Number((totalInches - feet * 12).toFixed(1));
    return `${feet} ft ${inches} in`;
  }
  return `${Number(valueInCm.toFixed(2))} cm`;
}

function ErrorRetry({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View className="gap-2">
      <Text className="text-destructive text-sm">{message}</Text>
      <Button variant="outline" size="sm" onPress={onRetry}>
        <Text>Retry</Text>
      </Button>
    </View>
  );
}

export default function ProfileScreen() {
  const {
    appSettings,
    updateAppSettings,
    isLoading: appSettingsLoading,
    error: appSettingsError,
    refetch: refetchAppSettings,
  } = useAppSettings();
  const {
    profile,
    saveProfile,
    isSaving,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useProfile();
  const {
    latest: latestWeight,
    history: weightHistory,
    addMeasurement: addWeight,
    isLoading: weightLoading,
    error: weightError,
    refetch: refetchWeight,
  } = useMeasurements("weight");
  const {
    latest: latestHeight,
    history: heightHistory,
    addMeasurement: addHeight,
    isLoading: heightLoading,
    error: heightError,
    refetch: refetchHeight,
  } = useMeasurements("height");
  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [weightValue, setWeightValue] = useState("");
  const [heightValue, setHeightValue] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName);
    setDateOfBirth(profile.dateOfBirth ? new Date(profile.dateOfBirth) : null);
  }, [profile]);

  const onSaveProfile = async () => {
    if (!displayName.trim()) return;
    await saveProfile({
      displayName: displayName.trim(),
      dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
    });
  };

  const onChangeDob = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === "dismissed") {
      setShowDobPicker(false);
      return;
    }
    if (!selected) return;
    setDateOfBirth(selected);
    setShowDobPicker(false);
  };

  const onAddWeight = async () => {
    const value = Number(weightValue.trim());
    if (!Number.isFinite(value) || value <= 0) return;
    const unit = appSettings?.weightUnit ?? "kg";
    const metricValue = toMetricWeight(value, unit);
    await addWeight({ value: metricValue, unit: "kg" });
    setWeightValue("");
  };

  const onAddHeight = async () => {
    if (appSettings?.heightUnit === "in") {
      const feet = Number(heightFeet.trim() || "0");
      const inches = Number(heightInches.trim() || "0");
      if (!Number.isFinite(feet) || !Number.isFinite(inches)) return;
      if (feet < 0 || inches < 0) return;
      const totalInches = feet * 12 + inches;
      if (totalInches <= 0) return;
      await addHeight({ value: toMetricHeight(totalInches, "in"), unit: "cm" });
      setHeightFeet("");
      setHeightInches("");
      return;
    }

    const value = Number(heightValue.trim());
    if (!Number.isFinite(value) || value <= 0) return;
    await addHeight({ value: toMetricHeight(value, "cm"), unit: "cm" });
    setHeightValue("");
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

  const profileCardLoading = profileLoading || appSettingsLoading;
  const profileCardError = profileError ?? appSettingsError;

  const weightLatestText = latestWeight
    ? (() => {
        const metricValue = toMetricWeight(latestWeight.value, latestWeight.unit as WeightUnit);
        const display = formatDisplayWeight(metricValue, appSettings?.weightUnit ?? "kg");
        return `${Number(display.value.toFixed(2))} ${display.unit}`;
      })()
    : "N/A";

  const heightLatestText = latestHeight
    ? toDisplayHeightCm(
        toMetricHeight(latestHeight.value, latestHeight.unit),
        appSettings?.heightUnit ?? "cm",
      )
    : "N/A";

  return (
    <CustomScreen scroll>
      <Text variant="h2">Profile</Text>
      <Text variant="muted">Profile + weight/height tracking.</Text>

      <View className="mt-6 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>

          {profileCardLoading ? (
            <CardContent className="gap-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          ) : profileCardError ? (
            <CardContent>
              <ErrorRetry
                message="Couldn't load your profile."
                onRetry={() => {
                  void refetchProfile();
                  void refetchAppSettings();
                }}
              />
            </CardContent>
          ) : (
            <>
              <CardContent className="gap-4">
                <View className="gap-2">
                  <Label>Unit system</Label>
                  <Tabs
                    value={appSettings?.heightUnit === "in" ? "imperial" : "metric"}
                    onValueChange={(value) => void onSwitchUnitSystem(value as "metric" | "imperial")}
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

                <View className="gap-2">
                  <Label>What should we call you?</Label>
                  <Input
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Display name"
                  />
                </View>

                <View className="gap-2">
                  <Label>Date of birth (optional)</Label>
                  <Button variant="outline" onPress={() => setShowDobPicker(true)}>
                    <Text>{dateOfBirth ? format(dateOfBirth, "PPP") : "Set date of birth"}</Text>
                  </Button>
                  {showDobPicker ? (
                    <DateTimePicker
                      mode="date"
                      value={dateOfBirth ?? new Date(2000, 0, 1)}
                      onChange={onChangeDob}
                    />
                  ) : null}
                </View>
              </CardContent>
              <CardFooter>
                <Button className="w-full" loading={isSaving} onPress={() => void onSaveProfile()}>
                  <Text>Save Profile</Text>
                </Button>
              </CardFooter>
            </>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weight</CardTitle>
            {!weightLoading && !weightError ? (
              <CardDescription>{`Latest ${weightLatestText}`}</CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="gap-3">
            {weightLoading ? (
              <View className="gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </View>
            ) : weightError ? (
              <ErrorRetry message="Couldn't load weight history." onRetry={refetchWeight} />
            ) : (
              <>
                <View className="flex-row items-center gap-2">
                  <Input
                    className="flex-1"
                    value={weightValue}
                    onChangeText={setWeightValue}
                    placeholder={`Weight (${appSettings?.weightUnit ?? "kg"})`}
                    keyboardType="decimal-pad"
                  />
                  <Button onPress={() => void onAddWeight()}>
                    <Text>Add</Text>
                  </Button>
                </View>
                <View className="gap-2">
                  {weightHistory
                    .slice(-5)
                    .reverse()
                    .map((item) => {
                      const metricValue = toMetricWeight(item.value, item.unit as WeightUnit);
                      const display = formatDisplayWeight(metricValue, appSettings?.weightUnit ?? "kg");
                      return (
                        <Card key={item.id} className="flex-row items-center justify-between px-4 py-3">
                          <Text variant="muted">{format(new Date(item.measuredAt), "PP")}</Text>
                          <Text variant="muted">{`${Number(display.value.toFixed(2))} ${display.unit}`}</Text>
                        </Card>
                      );
                    })}
                </View>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Height</CardTitle>
            {!heightLoading && !heightError ? (
              <CardDescription>{`Latest ${heightLatestText}`}</CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="gap-3">
            {heightLoading ? (
              <View className="gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </View>
            ) : heightError ? (
              <ErrorRetry message="Couldn't load height history." onRetry={refetchHeight} />
            ) : (
              <>
                <View className="flex-row items-center gap-2">
                  {appSettings?.heightUnit === "in" ? (
                    <>
                      <Input
                        className="flex-1"
                        value={heightFeet}
                        onChangeText={setHeightFeet}
                        placeholder="Feet"
                        keyboardType="number-pad"
                      />
                      <Input
                        className="flex-1"
                        value={heightInches}
                        onChangeText={setHeightInches}
                        placeholder="Inches"
                        keyboardType="number-pad"
                      />
                    </>
                  ) : (
                    <Input
                      className="flex-1"
                      value={heightValue}
                      onChangeText={setHeightValue}
                      placeholder="Height"
                      keyboardType="decimal-pad"
                    />
                  )}
                  <Button onPress={() => void onAddHeight()}>
                    <Text>Add</Text>
                  </Button>
                </View>
                <View className="gap-2">
                  {heightHistory
                    .slice(-5)
                    .reverse()
                    .map((item) => (
                      <Card key={item.id} className="flex-row items-center justify-between px-4 py-3">
                        <Text variant="muted">{format(new Date(item.measuredAt), "PP")}</Text>
                        <Text variant="muted">
                          {toDisplayHeightCm(
                            toMetricHeight(item.value, item.unit),
                            appSettings?.heightUnit ?? "cm",
                          )}
                        </Text>
                      </Card>
                    ))}
                </View>
              </>
            )}
          </CardContent>
        </Card>
      </View>
    </CustomScreen>
  );
}
