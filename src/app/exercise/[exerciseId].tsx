import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useLocalSearchParams } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import { Heart } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { CustomScreen } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FadeInView } from "@/components/ui/fade-in-view";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
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
    <View className="gap-1">
      <Text variant="small">{title}</Text>
      <View className="flex-row flex-wrap gap-1">
        {muscles.map((muscle) => (
          <Badge key={muscle} variant="outline">
            <Text>{muscle}</Text>
          </Badge>
        ))}
      </View>
    </View>
  );
}

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

function mostRecentAchievedAt(entries: (PersonalRecordEntry | null)[]): string | null {
  const dates = entries
    .filter((entry): entry is PersonalRecordEntry => Boolean(entry))
    .map((entry) => entry.achievedAt);
  if (dates.length === 0) return null;
  return dates.sort().at(-1) ?? null;
}

export default function ExerciseDetailScreen() {
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
      <Text variant="h2">{item?.name ?? "Exercise Detail"}</Text>

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
                <Text>Details</Text>
              </TabsTrigger>
              <TabsTrigger value="records" className="flex-1">
                <Text>Records</Text>
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex-1">
                <Text>Charts</Text>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card className="gap-0 overflow-hidden p-0">
                {item.imageUrl ? (
                  <View className="bg-white">
                    <ExpoImage
                      source={{ uri: item.imageUrl }}
                      style={{ width: "100%", aspectRatio: 1 }}
                      contentFit={"contain"}
                      placeholder={blurhash}
                    />
                  </View>
                ) : null}

                <CardContent className="gap-3 p-4">
                  <View className="flex-row items-center gap-1.5">
                    {item.category ? (
                      <Badge variant="secondary">
                        <Text>{item.category}</Text>
                      </Badge>
                    ) : null}
                    {isCustom ? (
                      <Badge variant="secondary">
                        <Text>Custom</Text>
                      </Badge>
                    ) : null}
                    {isCustom ? null : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto"
                        disabled={!canFavorite}
                        onPress={() => void onToggleFavorite()}
                      >
                        <Icon
                          as={Heart}
                          className={
                            item.isFavorite
                              ? "text-red-500"
                              : "text-muted-foreground"
                          }
                          fill={item.isFavorite ? "currentColor" : "none"}
                        />
                      </Button>
                    )}
                  </View>

                  {item.description ? (
                    <Text variant="muted">{item.description}</Text>
                  ) : null}

                  <Separator />

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
