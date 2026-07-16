import { useState } from "react";
import { View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useRouter } from "expo-router";

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
import { Text } from "@/components/ui/text";
import { useProfile } from "@/features/profile/hooks/useProfile";

export default function OnboardingScreen() {
  const router = useRouter();
  const { saveProfile, isSaving } = useProfile();
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

  return (
    <CustomScreen scroll>
      <View className="gap-1">
        <Text variant="h1">Welcome to Rep Report</Text>
        <Text variant="muted">
          Track workouts, save favorites, and watch your progress build — one set at a time.
        </Text>
      </View>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Let&apos;s set up your profile</CardTitle>
          <CardDescription>Just a name to get started — everything else is optional.</CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
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
            {nameError ? <Text className="text-destructive text-sm">Enter your name to continue.</Text> : null}
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
          <Button className="w-full" loading={isSaving} onPress={() => void onGetStarted()}>
            <Text>Let&apos;s Go</Text>
          </Button>
        </CardFooter>
      </Card>
    </CustomScreen>
  );
}
