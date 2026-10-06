import Constants from "expo-constants";
import { useRouter, type Href } from "expo-router";
import { Download, Ruler, Timer, TimerReset, Trash2, Upload } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Switch, View } from "react-native";
import { toast } from "sonner-native";

import { CustomScreen, ListRow, ScreenHeader } from "@/components/common";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DeveloperSection } from "@/components/DeveloperSection";
import { Text } from "@/components/ui/text";
import { useDataManagement } from "@/features/backup/hooks/useDataManagement";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";

const REST_TIMER_PRESETS = [
  { label: "60s", value: 60 },
  { label: "90s", value: 90 },
  { label: "2m", value: 120 },
  { label: "3m", value: 180 },
] as const;

const UNIT_SYSTEMS = [
  { label: "Metric", value: "metric" },
  { label: "Imperial", value: "imperial" },
] as const;

type SegmentedOption<T extends string | number> = { label: string; value: T };

/** A compact pill toggle that fits on the trailing side of a list row. */
function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View className="border-border bg-surface-inset flex-row rounded-full border p-0.5">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            role="button"
            accessibilityState={{ selected }}
            hitSlop={4}
            onPress={() => onChange(option.value)}
            className={cn(
              "h-9 min-w-11 items-center justify-center rounded-full px-3",
              selected && "bg-surface-raised",
            )}
          >
            <Text
              className={cn(
                "text-[13px] font-semibold",
                selected ? "text-foreground" : "text-text-3",
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function SettingsScreen() {
  const router = useRouter();
  const {
    heightUnit,
    restTimerEnabled,
    restTimerDefaultSeconds,
    updateAppSettings,
  } = useAppSettings();
  const { exportData, restoreData, deleteAllData, isBusy } = useDataManagement();
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const onSwitchUnitSystem = async (system: "metric" | "imperial") => {
    await updateAppSettings(
      system === "metric"
        ? { weightUnit: "kg", heightUnit: "cm", distanceUnit: "km" }
        : { weightUnit: "lb", heightUnit: "in", distanceUnit: "mi" },
    );
  };

  const onExport = async () => {
    try {
      await exportData();
    } catch (error) {
      toast.error("Export failed", { description: errorMessage(error, "Please try again.") });
    }
  };

  const onRestore = async () => {
    try {
      const outcome = await restoreData();
      if (outcome === "cancelled") return;
      toast.success("Backup restored");
      // Re-run the launch routing: the restored data decides between
      // onboarding and home.
      router.replace("/" as Href);
    } catch (error) {
      // A bad file is rejected before anything is touched, and a row the
      // database refuses rolls the whole restore back.
      toast.error("Restore failed", {
        description:
          error instanceof Error && error.name === "BackupFormatError"
            ? error.message
            : "Nothing on this device was changed.",
      });
    }
  };

  const onDeleteAll = async () => {
    try {
      await deleteAllData();
      toast("All data deleted");
      router.replace("/onboarding" as Href);
    } catch (error) {
      toast.error("Delete failed", { description: errorMessage(error, "Please try again.") });
    }
  };

  return (
    <CustomScreen scroll contentContainerStyle={{ paddingBottom: 24 }}>
      <ScreenHeader title="Settings" />

      <Text variant="sectionLabel" className="mb-1 mt-6">
        UNITS
      </Text>
      <ListRow
        icon={Ruler}
        label="Unit system"
        trailing={
          <Segmented
            options={UNIT_SYSTEMS}
            value={heightUnit === "in" ? "imperial" : "metric"}
            onChange={(system) => void onSwitchUnitSystem(system)}
          />
        }
      />

      <Text variant="sectionLabel" className="mb-1 mt-6">
        REST TIMER
      </Text>
      <ListRow
        icon={Timer}
        label="Rest timer"
        trailing={
          <Switch
            value={restTimerEnabled}
            onValueChange={(on) => void updateAppSettings({ restTimerEnabled: on ? 1 : 0 })}
            trackColor={{ false: THEME.border, true: THEME.primary }}
            // Left unset, Android paints the thumb Material blue, which
            // belongs to no palette in this app.
            thumbColor={restTimerEnabled ? THEME.primaryForeground : THEME.foreground}
            ios_backgroundColor={THEME.border}
          />
        }
      />
      <ListRow
        icon={TimerReset}
        label="Default rest"
        trailing={
          <Segmented
            options={REST_TIMER_PRESETS}
            value={restTimerDefaultSeconds}
            onChange={(seconds) => void updateAppSettings({ restTimerDefaultSeconds: seconds })}
          />
        }
      />

      <Text variant="sectionLabel" className="mb-1 mt-6">
        DATA
      </Text>
      <Text variant="body" className="text-text-3 mb-2">
        Everything is stored on this device only. Export a backup before
        reinstalling or switching phones.
      </Text>
      <ListRow icon={Download} label="Export data" disabled={isBusy} onPress={() => void onExport()} />
      <ListRow
        icon={Upload}
        label="Restore from backup"
        disabled={isBusy}
        onPress={() => setRestoreConfirmOpen(true)}
      />
      <ListRow
        icon={Trash2}
        label="Delete all data"
        destructive
        disabled={isBusy}
        onPress={() => setDeleteConfirmOpen(true)}
      />

      {__DEV__ ? <DeveloperSection /> : null}

      <Text variant="meta" className="text-text-4 mt-8 text-center">
        {`REP REPORT ${Constants.expoConfig?.version ?? ""}`.trim()}
      </Text>

      <ConfirmDialog
        open={restoreConfirmOpen}
        onOpenChange={setRestoreConfirmOpen}
        title="Restore from a backup?"
        description="This replaces everything on this device - workouts, templates, saved exercises, measurements and settings, including a workout in progress. Export first if you want to keep what's here."
        confirmLabel="Choose file"
        destructive
        onConfirm={() => {
          setRestoreConfirmOpen(false);
          void onRestore();
        }}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete all data?"
        description="Permanently deletes every workout, template, saved exercise and measurement on this device. This can't be undone."
        confirmLabel="Delete everything"
        destructive
        onConfirm={() => {
          setDeleteConfirmOpen(false);
          void onDeleteAll();
        }}
      />
    </CustomScreen>
  );
}
