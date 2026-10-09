import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Database, Eraser } from "lucide-react-native";
import { useState } from "react";
import { toast } from "sonner-native";

import { ListRow } from "@/components/common";
import { ConfirmDialog } from "@/components/ConfirmDialog";
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
function DeveloperSection() {
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

  return (
    <>
      <Text variant="sectionLabel" className="mb-1 mt-6">
        DEVELOPER
      </Text>
      <ListRow
        icon={Database}
        label={isSeeded ? "Re-seed demo data" : "Seed demo data"}
        value={isSeeded ? "LOADED" : undefined}
        disabled={isBusy}
        onPress={() => (isSeeded ? setSeedConfirmOpen(true) : void runSeed())}
      />
      <ListRow
        icon={Eraser}
        label="Clear demo data"
        destructive
        disabled={isBusy || !isSeeded}
        onPress={() => setClearConfirmOpen(true)}
      />

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
    </>
  );
}

export { DeveloperSection };
