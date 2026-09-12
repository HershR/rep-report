import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { View } from "react-native";
import { toast } from "sonner-native";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import {
  clearDemoData,
  isDemoDataSeeded,
  seedDemoData,
} from "@/db/devSeed";

const SEEDED_QUERY_KEY = ["demo-data-seeded"] as const;

/**
 * Dev-only tools, rendered from `settings.tsx` behind `__DEV__`. Fills the
 * database with a realistic training history so the progress, records and
 * history screens have something to show on a fresh install.
 */
function DeveloperCard() {
  const queryClient = useQueryClient();
  const [isBusy, setIsBusy] = useState(false);
  const [seedConfirmOpen, setSeedConfirmOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const seededQuery = useQuery({
    queryKey: SEEDED_QUERY_KEY,
    queryFn: isDemoDataSeeded,
  });
  const isSeeded = seededQuery.data ?? false;

  /**
   * Everything downstream of the database just changed, so invalidate the whole
   * cache rather than maintaining a list of keys that will drift out of date.
   */
  const refreshEverything = async () => {
    await queryClient.invalidateQueries();
  };

  const runSeed = async () => {
    setIsBusy(true);
    try {
      const counts = await seedDemoData();
      await refreshEverything();
      toast.success("Demo data seeded", {
        description: `${counts.sessions} workouts · ${counts.sets} sets · ${counts.exercises} exercises`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Demo seed failed", error);
      toast.error("Seeding failed", {
        description: error instanceof Error ? error.message : "Unknown error",
        duration: 4000,
      });
    } finally {
      setIsBusy(false);
    }
  };

  const runClear = async () => {
    setIsBusy(true);
    try {
      await clearDemoData();
      await refreshEverything();
      toast("Demo data cleared", { duration: 2500 });
    } catch (error) {
      console.error("Demo clear failed", error);
      toast.error("Clearing failed", {
        description: error instanceof Error ? error.message : "Unknown error",
        duration: 4000,
      });
    } finally {
      setIsBusy(false);
    }
  };

  const onSeedPress = () => {
    if (isSeeded) {
      setSeedConfirmOpen(true);
      return;
    }
    void runSeed();
  };

  return (
    <Card>
      <CardContent className="gap-4 pt-6">
        <View className="gap-1">
          <Label>Developer</Label>
          <Text variant="muted" className="text-xs">
            {isSeeded
              ? "Demo data is loaded. Seeding again replaces it and re-anchors the dates to today."
              : "Fills the database with two templates and about eight weeks of workouts and measurements."}
          </Text>
        </View>

        <View className="gap-2">
          <Button disabled={isBusy} onPress={onSeedPress}>
            <Text>{isBusy ? "Working..." : "Seed demo data"}</Text>
          </Button>
          <Button
            variant="outline"
            disabled={isBusy || !isSeeded}
            onPress={() => setClearConfirmOpen(true)}
          >
            <Text className="text-destructive">Clear demo data</Text>
          </Button>
        </View>
      </CardContent>

      <ConfirmDialog
        open={seedConfirmOpen}
        onOpenChange={setSeedConfirmOpen}
        title="Replace demo data?"
        description="The existing demo workouts, templates and measurements are deleted first. Saved exercises are kept, but their details are overwritten from the bundled wger data."
        confirmLabel="Replace"
        destructive
        onConfirm={() => {
          setSeedConfirmOpen(false);
          void runSeed();
        }}
      />

      <ConfirmDialog
        open={clearConfirmOpen}
        onOpenChange={setClearConfirmOpen}
        title="Clear demo data?"
        description="Deletes the seeded workouts, templates and measurements. Saved exercises are kept. This can't be undone."
        confirmLabel="Clear"
        destructive
        onConfirm={() => {
          setClearConfirmOpen(false);
          void runClear();
        }}
      />
    </Card>
  );
}

export { DeveloperCard };
