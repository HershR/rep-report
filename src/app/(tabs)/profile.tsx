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
  Weight,
  type LucideIcon,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { CustomScreen } from "@/components/common";
import { Button } from "@/components/ui/button";
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
    <View className="border-border bg-card h-[72px] flex-1 justify-between rounded-lg border p-3">
      <Text variant="microLabel">{label.toUpperCase()}</Text>
      <Text variant="numeral" className="text-[21px]" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function NavRow({
  icon,
  label,
  value,
  onPress,
}: {
  value?: string;
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      role="button"
      className="border-separator -mx-4 h-14 flex-row items-center gap-3 border-b px-4 active:opacity-80"
      onPress={onPress}
    >
      <Icon as={icon} className="text-text-3 size-5" />
      <Text className="flex-1 text-[15px] font-medium">{label}</Text>
      {value ? (
        <Text variant="meta" className="text-text-3">
          {value}
        </Text>
      ) : null}
      <Icon as={ChevronRight} className="text-text-4 size-4" />
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

  const initials = (profile?.displayName ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "—";

  const memberSince = profile?.createdAt
    ? `TRAINING SINCE ${format(new Date(profile.createdAt), "MMM yyyy").toUpperCase()}`
    : "SET UP YOUR PROFILE";

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
    <CustomScreen scroll contentContainerStyle={{ paddingBottom: 24 }}>
      <View className="h-9 flex-row items-center justify-between">
        <Text variant="screenTitle">Profile</Text>
        <Button
          variant="ghost"
          className="-mr-2.5 h-9 px-2.5"
          accessibilityLabel="Edit profile"
          onPress={openEdit}
        >
          <Icon as={Pencil} className="text-text-3 size-4" />
          <Text className="text-text-3 text-[13px] font-semibold">Edit</Text>
        </Button>
      </View>

      {profileLoading ? (
        <View className="mt-4 gap-4">
          <Skeleton className="h-14 w-52" />
          <Skeleton className="h-[72px] w-full" />
        </View>
      ) : (
        <>
          <View className="mt-4 flex-row items-center gap-3.5">
            <View className="border-border-strong bg-surface-raised size-14 items-center justify-center rounded-full border">
              <Text variant="numeral" className="text-primary text-[18px]">
                {initials}
              </Text>
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-[19px] font-bold tracking-tight">
                {profile?.displayName ?? "Your name"}
              </Text>
              <Text variant="microLabel">{memberSince}</Text>
            </View>
          </View>

          <View className="mt-4 flex-row gap-2">
            <Stat label="Age" value={ageText} />
            <Stat label="Weight" value={weightText} />
            <Stat label="Height" value={heightText} />
          </View>
        </>
      )}

      <View className="mt-6">
        <Text variant="sectionLabel" className="mb-2.5">
          BODY
        </Text>
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
          icon={Ruler}
          label="Body measurements"
          onPress={() => router.push("/profile/measurements" as Href)}
        />
      </View>

      <View className="mt-6">
        <Text variant="sectionLabel" className="mb-2.5">
          PREFERENCES
        </Text>
        <NavRow
          icon={Settings}
          label="Settings"
          value={`${weightUnit} · ${heightUnit}`}
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
