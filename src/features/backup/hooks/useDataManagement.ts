import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import {
  deleteAllData,
  exportAllData,
  importAllData,
  parseBackup,
} from "@/features/backup/repositories/backupRepository";

export type RestoreOutcome = "restored" | "cancelled";

/** Export, restore and wipe the whole local database. */
export function useDataManagement() {
  const queryClient = useQueryClient();

  // After a restore or wipe, every cached answer describes data that is gone.
  // resetQueries drops them all and refetches whatever is on screen.
  const resetCache = () => queryClient.resetQueries();

  const exportMutation = useMutation({
    mutationFn: async () => {
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error("Sharing isn't available on this device.");
      }
      const backup = await exportAllData();
      const file = new File(
        Paths.cache,
        `rep-report-backup-${format(new Date(), "yyyy-MM-dd-HHmm")}.json`,
      );
      if (file.exists) file.delete();
      file.create();
      file.write(JSON.stringify(backup));
      await Sharing.shareAsync(file.uri, {
        mimeType: "application/json",
        UTI: "public.json",
        dialogTitle: "Save your Rep Report backup",
      });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (): Promise<RestoreOutcome> => {
      // Any file type: saved backups often come back as octet-stream on
      // Android. parseBackup rejects anything that isn't one.
      const picked = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });
      if (picked.canceled) return "cancelled";
      const text = await new File(picked.assets[0].uri).text();
      await importAllData(parseBackup(text));
      return "restored";
    },
    onSuccess: async (outcome) => {
      if (outcome === "restored") await resetCache();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAllData,
    onSuccess: resetCache,
  });

  return {
    exportData: exportMutation.mutateAsync,
    restoreData: restoreMutation.mutateAsync,
    deleteAllData: deleteMutation.mutateAsync,
    isBusy: exportMutation.isPending || restoreMutation.isPending || deleteMutation.isPending,
  };
}
