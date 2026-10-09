import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import { toast } from "sonner-native";
import { Image as ExpoImage } from "expo-image";
import { Bookmark, ChevronLeft, Plus } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { CustomScreen, EmptyState, ErrorState, LoadingState } from "@/components/common";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FadeInView } from "@/components/ui/fade-in-view";
import { Icon } from "@/components/ui/icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { ExerciseProgressChart } from "@/features/charts/components/ExerciseProgressChart";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import { useActiveWorkout } from "@/features/workouts/hooks/useActiveWorkout";
import { isCardioExercise } from "@/features/workouts/utils/isCardioExercise";
import {
  getExerciseById,
  getExerciseByWgerId,
} from "@/features/exercises/repositories/exerciseRepository";
import { useExercisePersonalRecords } from "@/features/personal-records/hooks/usePersonalRecords";
import type { PersonalRecordEntry } from "@/features/personal-records/types";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { toDisplayWeight, weightToText } from "@/lib/units";
import { getWgerExerciseById, WgerUnavailableError } from "@/services/wger/client";
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

  const { saveFavoriteExercise, removeFavoriteExercise } = useFavoriteExercises();
  const {
    activeWorkout,
    startWorkout,
    addExerciseToWorkout,
    isSaving: workoutSaving,
  } = useActiveWorkout();
  const [addingToWorkout, setAddingToWorkout] = useState(false);
  const { weightUnit } = useAppSettings();

  const query = useQuery({
    queryKey: ["exercise-detail", source, exerciseId],
    enabled: Boolean(exerciseId),
    queryFn: async () => {
      if (!exerciseId) return null;
      if (source === "local") {
        return getExerciseById(exerciseId);
      }
      // Prefer the local copy of a WGER exercise when there is one: it opens
      // offline, carries the right favorite state, and - having a local id -
      // unlocks records and charts. Only an exercise never saved or logged
      // needs the network.
      const local = await getExerciseByWgerId(Number(exerciseId));
      if (local) return local;
      return getWgerExerciseById(Number(exerciseId));
    },
  });

  const item = query.data;
  /**
   * The local row id, when this exercise has one. History, records and charts
   * all hang off it - gating them on the `source` route param instead hid them
   * for any saved exercise opened from Search.
   */
  const localExerciseId = item && "createdAt" in item ? item.id : null;

  const { records: personalRecords, isLoading: personalRecordsLoading } =
    useExercisePersonalRecords(localExerciseId ?? undefined);
  const mostRecentPrDate = personalRecords
    ? mostRecentAchievedAt([
        personalRecords.heaviestWeight,
        personalRecords.bestSetVolume,
        personalRecords.bestSessionVolume,
        personalRecords.mostReps,
        personalRecords.bestEstimated1RM,
      ])
    : null;
  const isCustom = item?.source === "custom";
  const canFavorite = Boolean(item?.wgerExerciseId);

  /**
   * Sessions reference local exercise rows, and a wger exercise only gets one
   * by being saved - which is also how the workout picker finds it later. So
   * an unsaved exercise is saved on the way in, and the toast says so.
   */
  const onAddToWorkout = async () => {
    if (!item) return;
    setAddingToWorkout(true);
    try {
      let localId = localExerciseId;
      let didSave = false;

      if (!localId && item.wgerExerciseId !== null) {
        const saved = await saveFavoriteExercise({
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
        localId = saved.id;
        didSave = true;
      }
      if (!localId) return;

      const hadWorkout = activeWorkout?.status === "active";
      const session = hadWorkout
        ? activeWorkout
        : await startWorkout({ name: "Workout" });

      await addExerciseToWorkout({
        workoutSessionId: session.id,
        exerciseId: localId,
      });

      if (hadWorkout) {
        toast.success(
          didSave
            ? `Saved and added to ${session.name}`
            : `Added to ${session.name}`,
        );
      } else {
        // A workout that did not exist a moment ago deserves to be shown.
        router.push({
          pathname: "/workout/active",
          params: { sessionId: session.id },
        });
      }
    } finally {
      setAddingToWorkout(false);
    }
  };

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
    <CustomScreen
      scroll
      contentContainerStyle={{ paddingBottom: 16 }}
      stickyFooter={
        item ? (
          <View className="border-border bg-surface-sunken border-t px-4 pt-3.5 pb-5">
            <Button
              size="lg"
              loading={addingToWorkout || workoutSaving}
              onPress={() => void onAddToWorkout()}
            >
              <Icon as={Plus} className="text-primary-foreground size-[18px]" />
              <Text>
                {activeWorkout?.status === "active"
                  ? "Add to workout"
                  : "Start workout with this"}
              </Text>
            </Button>
          </View>
        ) : null
      }
    >
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

      {query.isLoading ? <LoadingState className="mt-4" /> : null}

      {query.isError ? (
        <ErrorState
          className="mt-4"
          title={
            query.error instanceof WgerUnavailableError
              ? "This exercise needs a connection"
              : "Couldn't load this exercise"
          }
          message={
            query.error instanceof WgerUnavailableError
              ? "Save it while online and it'll open offline from then on."
              : undefined
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {!query.isLoading && !query.isError && !item ? (
        <EmptyState className="mt-4" message="Exercise not found." />
      ) : null}

      {item && localExerciseId && personalRecords ? (
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
              <View className="gap-4 pt-2">
                {item.imageUrl ? (
                  // Light ground on purpose: WGER drawings are black line art on
                  // transparency and vanish against the dark theme.
                  <View className="border-border bg-neutral-200 overflow-hidden rounded-lg border">
                    <ExpoImage
                      source={{ uri: item.imageUrl }}
                      style={{ width: "100%", aspectRatio: 16 / 10 }}
                      contentFit={"contain"}
                      placeholder={blurhash}
                    />
                  </View>
                ) : null}

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
              </View>
            </TabsContent>

            {/* The headline records sit in the strip above; this tab holds the
                volume records that don't fit there. */}
            <TabsContent value="records">
              {!localExerciseId ? (
                <EmptyState message="Save or log this exercise to start tracking personal records." />
              ) : personalRecordsLoading ? (
                <LoadingState />
              ) : personalRecords ? (
                <View className="gap-3 pt-2">
                  <View className="flex-row gap-2">
                    <Stat
                      label={`BEST SET · ${weightUnit.toUpperCase()}`}
                      value={
                        personalRecords.bestSetVolume?.volume != null
                          ? Math.round(
                              toDisplayWeight(personalRecords.bestSetVolume.volume, weightUnit),
                            ).toLocaleString()
                          : "—"
                      }
                    />
                    <Stat
                      label={`BEST SESSION · ${weightUnit.toUpperCase()}`}
                      value={
                        personalRecords.bestSessionVolume?.volume != null
                          ? Math.round(
                              toDisplayWeight(personalRecords.bestSessionVolume.volume, weightUnit),
                            ).toLocaleString()
                          : "—"
                      }
                    />
                  </View>
                  {mostRecentPrDate ? (
                    <Text variant="meta" className="text-text-3 text-center">
                      {`LAST PR ${format(new Date(mostRecentPrDate), "PP").toUpperCase()}`}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <EmptyState message="Log a workout with this exercise to see personal records." />
              )}
            </TabsContent>

            <TabsContent value="charts">
              {localExerciseId ? (
                <View className="border-border bg-surface-sunken mt-2 rounded-lg border p-4">
                  <ExerciseProgressChart
                    exerciseId={localExerciseId}
                    weightUnit={weightUnit}
                    isCardio={isCardioExercise(item.category, item.name)}
                  />
                </View>
              ) : (
                <EmptyState message="Save or log this exercise to see progress charts." />
              )}
            </TabsContent>
          </Tabs>
        </FadeInView>
      ) : null}
    </CustomScreen>
  );
}
