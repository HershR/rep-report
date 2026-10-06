import { useState } from "react";
import { View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useRouter, type Href } from "expo-router";
import { toast } from "sonner-native";

import { CustomScreen } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { useDataManagement } from "@/features/backup/hooks/useDataManagement";
import { useProfile } from "@/features/profile/hooks/useProfile";

export default function OnboardingScreen() {
  const router = useRouter();
  const { saveProfile, isSaving } = useProfile();
  const { restoreData, isBusy: isRestoring } = useDataManagement();
  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);

  const nameError = nameTouched && !displayName.trim();

  const onChangeDob = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === "dismissed") {
      setShowDobPicker(false);
      return;
    }
    if (!selected) return;
    setDateOfBirth(selected);
    setShowDobPicker(false);
  };

  const onGetStarted = async () => {
    if (!displayName.trim()) {
      setNameTouched(true);
      return;
    }
    await saveProfile({
      displayName: displayName.trim(),
      dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
    });
    router.replace("/(tabs)/home");
  };

  // A fresh install lands here, so this is where someone coming back from a
  // reinstall needs to find their backup.
  const onRestore = async () => {
    try {
      const outcome = await restoreData();
      if (outcome === "cancelled") return;
      toast.success("Backup restored");
      router.replace("/" as Href);
    } catch (error) {
      toast.error("Restore failed", {
        description:
          error instanceof Error && error.name === "BackupFormatError"
            ? error.message
            : "Nothing on this device was changed.",
      });
    }
  };

  return (
    <CustomScreen scroll>
      <View className="mt-10 gap-2">
        <Text variant="sectionLabel">WELCOME TO</Text>
        <Text variant="hero">Rep Report</Text>
        <Text variant="body" className="text-text-3 mt-1">
          Track workouts, save exercises, and watch your progress build - one
          set at a time. Everything stays on this device.
        </Text>
      </View>

      <View className="mt-10 gap-5">
        <View className="gap-2">
          <Label>What should we call you?</Label>
          <Input
            value={displayName}
            onChangeText={(text) => {
              setDisplayName(text);
              if (text.trim()) setNameTouched(false);
            }}
            placeholder="Display name"
            autoFocus
          />
          {nameError ? (
            <Text className="text-destructive text-sm">Enter your name to continue.</Text>
          ) : null}
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
      </View>

      <Button size="lg" className="mt-10" loading={isSaving} onPress={() => void onGetStarted()}>
        <Text>Get started</Text>
      </Button>
      <Button
        variant="ghost"
        className="mt-2"
        disabled={isRestoring}
        onPress={() => void onRestore()}
      >
        <Text className="text-text-3">Restore from a backup</Text>
      </Button>
    </CustomScreen>
  );
}
