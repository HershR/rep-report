import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { ActivityIndicator, Pressable, View } from "react-native";

import { CustomScreen, ScreenHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { WeightUnit } from "@/db/schema";
import { usePersonalRecords } from "@/features/personal-records/hooks/usePersonalRecords";
import type { ExercisePersonalRecordsSummary } from "@/features/personal-records/types";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { THEME } from "@/lib/theme";
import { weightToText } from "@/lib/units";

type PrRow =
  | { key: string; kind: "loading" }
  | { key: string; kind: "error" }
  | { key: string; kind: "empty" }
  | { key: string; kind: "record"; record: ExercisePersonalRecordsSummary };

function headlineText(
  record: ExercisePersonalRecordsSummary,
  weightUnit: WeightUnit,
): string {
  if (record.heaviestWeight) {
    const weightText = `${weightToText(record.heaviestWeight.weight, weightUnit)} ${weightUnit}`;
    return record.heaviestWeight.reps !== null
      ? `${weightText} × ${record.heaviestWeight.reps}`
      : weightText;
  }
  if (record.mostReps) {
    return `${record.mostReps.reps} reps`;
  }
  return "—";
}

export default function PersonalRecordsScreen() {
  const router = useRouter();
  const { colorScheme: scheme } = useColorScheme();
  const colors = THEME[scheme ?? "light"];
  const { appSettings } = useAppSettings();
  const weightUnit = appSettings?.weightUnit ?? "lb";
  const { records, isLoading, error, refetch } = usePersonalRecords();

  const rows: PrRow[] = isLoading
    ? [{ key: "loading", kind: "loading" }]
    : error
      ? [{ key: "error", kind: "error" }]
      : records.length === 0
        ? [{ key: "empty", kind: "empty" }]
        : records.map((record) => ({
            key: record.exerciseId,
            kind: "record" as const,
            record,
          }));

  return (
    <CustomScreen>
      <View className="mb-3">
        <ScreenHeader title="Personal Records" />
      </View>

      <FlashList
        data={rows}
        keyExtractor={(row) => row.key}
        getItemType={(row) => row.kind}
        style={{ flex: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => {
          switch (item.kind) {
            case "loading":
              return (
                <View className="items-center py-4">
                  <ActivityIndicator color={colors.primary} />
                </View>
              );
            case "error":
              return (
                <Card>
                  <CardContent className="gap-2">
                    <Text className="text-destructive text-sm">
                      Could not load personal records.
                    </Text>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => void refetch()}
                    >
                      <Text>Retry</Text>
                    </Button>
                  </CardContent>
                </Card>
              );
            case "empty":
              return (
                <Card>
                  <CardContent>
                    <Text variant="muted">
                      Complete a workout to start tracking personal records.
                    </Text>
                  </CardContent>
                </Card>
              );
            case "record":
              return (
                <Pressable
                  className="active:opacity-80"
                  onPress={() =>
                    router.push({
                      pathname: "/exercise/[exerciseId]",
                      params: {
                        exerciseId: item.record.exerciseId,
                        source: "local",
                      },
                    })
                  }
                >
                  <Card className="py-0">
                    <CardContent className="flex-row items-center gap-3 py-3">
                      <Text className="flex-1">{item.record.exerciseName}</Text>
                      <Text variant="muted">
                        {headlineText(item.record, weightUnit)}
                      </Text>
                      <Icon
                        as={ChevronRight}
                        className="text-muted-foreground"
                      />
                    </CardContent>
                  </Card>
                </Pressable>
              );
          }
        }}
      />
    </CustomScreen>
  );
}
