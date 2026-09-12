import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import { Bookmark, ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { CustomScreen } from "@/components/common";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FadeInView } from "@/components/ui/fade-in-view";
import { Icon } from "@/components/ui/icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { ExerciseProgressChart } from "@/features/charts/components/ExerciseProgressChart";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import { getExerciseById } from "@/features/exercises/repositories/exerciseRepository";
import { useExercisePersonalRecords } from "@/features/personal-records/hooks/usePersonalRecords";
import type { PersonalRecordEntry } from "@/features/personal-records/types";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { weightToText } from "@/lib/units";
import { getWgerExerciseById } from "@/services/wger/client";
const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

function MuscleGroup({ title, muscles }: { title: string; muscles: string[] }) {
  if (muscles.length === 0) return null;
  return (
    <View className="gap-2.5">
      <Text variant="sectionLabel">{title.toUpperCase()}</Text>
      <View className="flex-row flex-wrap gap-2">
        {muscles.map((muscle) => (
          <View
            key={muscle}
            className="border-border bg-surface-inset h-8 justify-center rounded-full border px-3"
          >
            <Text className="text-text-2 text-xs font-medium">{muscle}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View
      className={cn(
        "bg-card h-[78px] flex-1 justify-between rounded-lg border p-3",
        accent ? "border-primary/30" : "border-border",
      )}
    >
      <Text variant="microLabel" className={cn(accent && "text-primary")}>
        {label}
      </Text>
      <Text variant="numeral" className="text-[22px]" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function mostRecentAchievedAt(entries: (PersonalRecordEntry | null)[]): string | null {
  const dates = entries
    .filter((entry): entry is PersonalRecordEntry => Boolean(entry))
    .map((entry) => entry.achievedAt);
  if (dates.length === 0) return null;
  return dates.sort().at(-1) ?? null;
}

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    exerciseId: string;
    source?: "local" | "wger";
  }>();
  const source = params.source ?? "wger";
  const exerciseId = params.exerciseId;
  const [tab, setTab] = useState<"details" | "records" | "charts">("details");

  const { saveFavoriteExercise, removeFavoriteExercise } =
    useFavoriteExercises();
  const { appSettings } = useAppSettings();
  const weightUnit = appSettings?.weightUnit ?? "lb";
  const { records: personalRecords, isLoading: personalRecordsLoading } =
    useExercisePersonalRecords(source === "local" ? exerciseId : undefined);
  const mostRecentPrDate = personalRecords
    ? mostRecentAchievedAt([
        personalRecords.heaviestWeight,
        personalRecords.bestSetVolume,
        personalRecords.bestSessionVolume,
        personalRecords.mostReps,
        personalRecords.bestEstimated1RM,
      ])
    : null;

  const query = useQuery({
    queryKey: ["exercise-detail", source, exerciseId],
    enabled: Boolean(exerciseId),
    queryFn: async () => {
      if (!exerciseId) return null;
      if (source === "local") {
        return getExerciseById(exerciseId);
      }
      return getWgerExerciseById(Number(exerciseId));
    },
  });

  const item = query.data;
  const isCustom = item?.source === "custom";
  const canFavorite = Boolean(item?.wgerExerciseId);

  const onToggleFavorite = async () => {
    if (!item || item.wgerExerciseId === null) return;
    if (item.isFavorite) {
      await removeFavoriteExercise({ wgerExerciseId: item.wgerExerciseId });
      return;
    }

    await saveFavoriteExercise({
      id: String(item.wgerExerciseId),
      wgerExerciseId: item.wgerExerciseId,
      name: item.name,
      description: item.description,
      category: item.category,
      equipment: item.equipment,
      primaryMuscles: item.primaryMuscles,
      secondaryMuscles: item.secondaryMuscles,
      imageUrl: item.imageUrl,
      source: "wger",
      isFavorite: true,
    });
  };

  return (
    <CustomScreen scroll>
      <View className="-mx-2 -mt-1 flex-row items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="size-11"
          accessibilityLabel="Back"
          onPress={() => router.back()}
        >
          <Icon as={ChevronLeft} className="text-foreground size-5" />
        </Button>
        {item && !isCustom ? (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "size-11 rounded-full",
              item.isFavorite && "bg-primary/10",
            )}
            disabled={!canFavorite}
            accessibilityLabel={
              item.isFavorite ? "Remove from saved" : "Save exercise"
            }
            onPress={() => void onToggleFavorite()}
          >
            <Icon
              as={Bookmark}
              className={item.isFavorite ? "text-primary" : "text-text-3"}
              fill={item.isFavorite ? "currentColor" : "none"}
            />
          </Button>
        ) : null}
      </View>

      <Text variant="screenTitle" className="mt-1 text-[27px] leading-tight">
        {item?.name ?? "Exercise Detail"}
      </Text>

      {item ? (
        <View className="mt-2.5 flex-row flex-wrap gap-2">
          {[item.category, item.equipment[0], isCustom ? "Custom" : null]
            .filter(Boolean)
            .map((label) => (
              <View
                key={label as string}
                className="bg-surface-raised h-[26px] justify-center rounded-full px-3"
              >
                <Text variant="microLabel" className="text-text-2">
                  {String(label).toUpperCase()}
                </Text>
              </View>
            ))}
        </View>
      ) : null}

      {query.isLoading ? (
        <Text variant="muted" className="mt-4">
          Loading exercise...
        </Text>
      ) : null}

      {query.isError ? (
        <Card className="mt-4">
          <CardContent>
            <Text>Could not load exercise details.</Text>
          </CardContent>
        </Card>
      ) : null}

      {!query.isLoading && !query.isError && !item ? (
        <Card className="mt-4">
          <CardContent>
            <Text>Exercise not found.</Text>
          </CardContent>
        </Card>
      ) : null}

      {item && source === "local" && personalRecords ? (
        <View className="mt-4 flex-row gap-2">
          <Stat
            label="EST. 1RM"
            accent
            value={
              personalRecords.bestEstimated1RM?.volume != null
                ? weightToText(personalRecords.bestEstimated1RM.volume, weightUnit)
                : "—"
            }
          />
          <Stat
            label="HEAVIEST"
            value={
              personalRecords.heaviestWeight
                ? weightToText(personalRecords.heaviestWeight.weight, weightUnit)
                : "—"
            }
          />
          <Stat
            label="MOST REPS"
            value={
              personalRecords.mostReps
                ? String(personalRecords.mostReps.reps)
                : "—"
            }
          />
        </View>
      ) : null}

      {item ? (
        <FadeInView>
          <Tabs
            className="mt-4"
            value={tab}
            onValueChange={(value) =>
              setTab(value as "details" | "records" | "charts")
            }
          >
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">
                <Text>How to</Text>
              </TabsTrigger>
              <TabsTrigger value="records" className="flex-1">
                <Text>Records</Text>
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex-1">
                <Text>Charts</Text>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card className="gap-0 overflow-hidden border-0 bg-transparent p-0">
                {item.imageUrl ? (
                  <View className="border-border bg-neutral-200 overflow-hidden rounded-lg border">
                    <ExpoImage
                      source={{ uri: item.imageUrl }}
                      style={{ width: "100%", aspectRatio: 16 / 10 }}
                      contentFit={"contain"}
                      placeholder={blurhash}
                    />
                  </View>
                ) : null}

                <CardContent className="gap-4 px-0 pt-4">
                  {item.description ? (
                    <Text variant="body">{item.description}</Text>
                  ) : null}

                  <View className="gap-3">
                    <MuscleGroup title="Equipment" muscles={item.equipment} />
                    <MuscleGroup
                      title="Primary muscles"
                      muscles={item.primaryMuscles}
                    />
                    <MuscleGroup
                      title="Secondary muscles"
                      muscles={item.secondaryMuscles}
                    />
                  </View>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="records">
              <Card>
                <CardContent className="gap-2 pt-6">
                  {source !== "local" ? (
                    <Text variant="muted">
                      Save this exercise as a favorite to start tracking
                      personal records.
                    </Text>
                  ) : personalRecordsLoading ? null : personalRecords ? (
                    <>
                      <View className="flex-row">
                        <Stat
                          label="Est. 1RM"
                          value={
                            personalRecords.bestEstimated1RM?.volume != null
                              ? `${weightToText(personalRecords.bestEstimated1RM.volume, weightUnit)} ${weightUnit}`
                              : "—"
                          }
                        />
                        <Stat
                          label="Heaviest"
                          value={
                            personalRecords.heaviestWeight
                              ? `${weightToText(personalRecords.heaviestWeight.weight, weightUnit)} ${weightUnit}`
                              : "—"
                          }
                        />
                        <Stat
                          label="Most Reps"
                          value={
                            personalRecords.mostReps
                              ? String(personalRecords.mostReps.reps)
                              : "—"
                          }
                        />
                      </View>
                      <View className="flex-row">
                        <Stat
                          label="Best Set Vol."
                          value={
                            personalRecords.bestSetVolume
                              ? `${weightToText(personalRecords.bestSetVolume.volume, weightUnit)} ${weightUnit}`
                              : "—"
                          }
                        />
                        <Stat
                          label="Best Session Vol."
                          value={
                            personalRecords.bestSessionVolume
                              ? `${weightToText(personalRecords.bestSessionVolume.volume, weightUnit)} ${weightUnit}`
                              : "—"
                          }
                        />
                        <View className="flex-1" />
                      </View>
                      {mostRecentPrDate ? (
                        <Text variant="muted" className="text-center text-xs">
                          {`Last PR hit ${format(new Date(mostRecentPrDate), "PP")}`}
                        </Text>
                      ) : null}
                    </>
                  ) : (
                    <Text variant="muted">
                      Log a workout with this exercise to see personal records.
                    </Text>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="charts">
              <Card>
                <CardContent className="gap-2 pt-6">
                  {source !== "local" ? (
                    <Text variant="muted">
                      Save this exercise as a favorite to see progress charts.
                    </Text>
                  ) : (
                    <ExerciseProgressChart
                      exerciseId={exerciseId}
                      weightUnit={weightUnit}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </FadeInView>
      ) : null}
    </CustomScreen>
  );
}
