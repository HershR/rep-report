import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { differenceInYears, format } from "date-fns";
import { useRouter, type Href } from "expo-router";
import {
  ChevronRight,
  Pencil,
  Ruler,
  Settings,
  Trophy,
  Weight,
  type LucideIcon,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { CustomScreen } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import type { WeightUnit } from "@/db/schema";
import { useMeasurements } from "@/features/measurements/hooks/useMeasurements";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { useProfile } from "@/features/profile/hooks/useProfile";
import {
  toDisplayHeightCm,
  toMetricHeight,
  toMetricWeight,
  weightToText,
} from "@/lib/units";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center gap-1">
      <Text variant="large">{value}</Text>
      <Text variant="muted" className="text-xs uppercase">
        {label}
      </Text>
    </View>
  );
}

function NavRow({
  icon,
  label,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable className="active:opacity-80" onPress={onPress}>
      <Card className="py-0">
        <CardContent className="flex-row items-center gap-3 py-3">
          <Icon as={icon} className="text-muted-foreground size-5" />
          <Text className="flex-1">{label}</Text>
          <Icon as={ChevronRight} className="text-muted-foreground" />
        </CardContent>
      </Card>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const {
    profile,
    saveProfile,
    isSaving,
    isLoading: profileLoading,
  } = useProfile();
  const { appSettings } = useAppSettings();
  const weightUnit = appSettings?.weightUnit ?? "kg";
  const heightUnit = appSettings?.heightUnit ?? "cm";
  const { latest: latestWeight } = useMeasurements("weight");
  const { latest: latestHeight } = useMeasurements("height");

  const [editOpen, setEditOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);

  const openEdit = () => {
    setDisplayName(profile?.displayName ?? "");
    setDateOfBirth(profile?.dateOfBirth ? new Date(profile.dateOfBirth) : null);
    setShowDobPicker(false);
    setEditOpen(true);
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

  const onSaveProfile = async () => {
    if (!displayName.trim()) return;
    await saveProfile({
      displayName: displayName.trim(),
      dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
    });
    setEditOpen(false);
  };

  const ageText = profile?.dateOfBirth
    ? String(differenceInYears(new Date(), new Date(profile.dateOfBirth)))
    : "—";

  const weightText = latestWeight
    ? `${weightToText(toMetricWeight(latestWeight.value, latestWeight.unit as WeightUnit), weightUnit)} ${weightUnit}`
    : "—";

  const heightText = latestHeight
    ? toDisplayHeightCm(
        toMetricHeight(latestHeight.value, latestHeight.unit),
        heightUnit,
      )
    : "—";

  return (
    <CustomScreen scroll contentContainerStyle={{ gap: 16 }}>
      <Text variant="h2">Profile</Text>

      <Card>
        <CardContent className="gap-4 pt-6">
          {profileLoading ? (
            <View className="gap-4">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-12 w-full" />
            </View>
          ) : (
            <>
              <View className="flex-row items-start justify-between">
                <View className="flex-1 gap-1">
                  <Text variant="h3">
                    {profile?.displayName ?? "Your name"}
                  </Text>
                </View>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onPress={openEdit}
                >
                  <Icon as={Pencil} className="text-muted-foreground size-4" />
                </Button>
              </View>

              <View className="flex-row">
                <Stat label="Age" value={ageText} />
                <Stat label="Weight" value={weightText} />
                <Stat label="Height" value={heightText} />
              </View>
            </>
          )}
        </CardContent>
      </Card>

      <View className="gap-2">
        <NavRow
          icon={Trophy}
          label="Personal records"
          onPress={() => router.push("/profile/personal-records" as Href)}
        />
        <NavRow
          icon={Weight}
          label="Weight history"
          onPress={() => router.push("/profile/weight-history" as Href)}
        />
        <NavRow
          icon={Ruler}
          label="Height history"
          onPress={() => router.push("/profile/height-history" as Href)}
        />
        <NavRow
          icon={Settings}
          label="Settings"
          onPress={() => router.push("/settings" as Href)}
        />
      </View>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>

          <View className="gap-4">
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
                <Text>
                  {dateOfBirth
                    ? format(dateOfBirth, "PPP")
                    : "Set date of birth"}
                </Text>
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

          <DialogFooter>
            <Button variant="outline" onPress={() => setEditOpen(false)}>
              <Text>Cancel</Text>
            </Button>
            <Button loading={isSaving} onPress={() => void onSaveProfile()}>
              <Text>Save</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CustomScreen>
  );
}
