import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import * as DocumentPicker from "expo-document-picker";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import {
  deleteAllData,
  exportAllData,
  importAllData,
  parseBackup,
} from "@/features/backup/repositories/backupRepository";

export type ExportDestination = "device" | "share";
export type ExportOutcome =
  | { status: "saved"; fileName: string }
  | { status: "shared" }
  | { status: "cancelled" };
export type RestoreOutcome = "restored" | "cancelled";

const backupFileName = () =>
  `rep-report-backup-${format(new Date(), "yyyy-MM-dd-HHmmss")}.json`;

// iOS rejects with ERR_FILE_PICKING_CANCELLED, Android with ERR_PICKER_CANCELLED.
function isPickerCancelled(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === "string" && code.endsWith("_CANCELLED");
}

/** Export, restore and wipe the whole local database. */
export function useDataManagement() {
  const queryClient = useQueryClient();

  // After a restore or wipe, every cached answer describes data that is gone.
  // resetQueries drops them all and refetches whatever is on screen.
  const resetCache = () => queryClient.resetQueries();

  const exportMutation = useMutation({
    mutationFn: async (destination: ExportDestination): Promise<ExportOutcome> => {
      const fileName = backupFileName();

      if (destination === "device") {
        // The system folder picker: Files on iOS, the storage access
        // framework on Android (Downloads, Documents, an SD card...).
        const directory = await Directory.pickDirectoryAsync().catch((error: unknown) => {
          if (isPickerCancelled(error)) return null;
          throw error;
        });
        if (!directory) return { status: "cancelled" };
        const json = JSON.stringify(await exportAllData());
        directory.createFile(fileName, "application/json").write(json);
        return { status: "saved", fileName };
      }

      if (!(await Sharing.isAvailableAsync())) {
        throw new Error("Sharing isn't available on this device.");
      }
      const backup = await exportAllData();
      const file = new File(Paths.cache, fileName);
      if (file.exists) file.delete();
      file.create();
      file.write(JSON.stringify(backup));
      await Sharing.shareAsync(file.uri, {
        mimeType: "application/json",
        UTI: "public.json",
        dialogTitle: "Share your Rep Report backup",
      });
      return { status: "shared" };
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
