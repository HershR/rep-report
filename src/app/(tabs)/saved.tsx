import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { FlashList } from "@shopify/flash-list";

import { CustomScreen, ScreenHeader } from "@/components/common";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { ExerciseCard } from "@/features/exercises/components/ExerciseCard";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import type { Exercise } from "@/features/exercises/types";
import { TemplateCard } from "@/features/templates/components/TemplateCard";
import { useWorkoutTemplates } from "@/features/templates/hooks/useWorkoutTemplates";
import type { WorkoutTemplate } from "@/features/templates/types";

type SavedTab = "exercises" | "templates";

type SavedRow =
  | { key: string; kind: "loading"; variant: SavedTab }
  | { key: string; kind: "error"; message: string; onRetry: () => void }
  | {
      key: string;
      kind: "empty";
      message: string;
      actionLabel: string;
      onAction: () => void;
    }
  | { key: string; kind: "exercise"; exercise: Exercise }
  | { key: string; kind: "template"; template: WorkoutTemplate };

/** Placeholder rows shown while a list loads. */
const SKELETON_ROW_COUNT = 3;

/** Mirrors ExerciseCard: 56px thumbnail + name/category stack. */
function ExerciseSkeleton() {
  return (
    <Card className="overflow-hidden p-0">
      <View className="flex-row items-center gap-3 p-4">
        <Skeleton className="h-14 w-14 rounded-md" />
        <View className="flex-1 gap-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </View>
      </View>
    </Card>
  );
}

/** Mirrors TemplateCard: name + description + exercise-count badge. */
function TemplateSkeleton() {
  return (
    <Card className="p-0">
      <View className="gap-2 p-4">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="mt-1 h-5 w-24 rounded-full" />
      </View>
    </Card>
  );
}

export default function SavedScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<SavedTab>("exercises");
  const { favorites, isLoading, error, refetch, removeFavoriteExercise } =
    useFavoriteExercises();
  const {
    templates,
    isLoading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates,
    deleteWorkoutTemplate,
  } = useWorkoutTemplates();
  const [exerciseToRemove, setExerciseToRemove] = useState<Exercise | null>(
    null,
  );
  const [templateToDelete, setTemplateToDelete] =
    useState<WorkoutTemplate | null>(null);

  const goToSearch = () => router.push("/(tabs)/search" as Href);
  const goToNewExercise = () => router.push("/exercise/new" as Href);
  const goToNewTemplate = () => router.push("/workout/template/new" as Href);

  const confirmRemoveFavorite = async () => {
    if (!exerciseToRemove) return;
    await removeFavoriteExercise({ id: exerciseToRemove.id });
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;
    await deleteWorkoutTemplate(templateToDelete.id);
  };

  const exerciseRows: SavedRow[] = isLoading
    ? [{ key: "exercises-loading", kind: "loading", variant: "exercises" }]
    : error
      ? [
          {
            key: "exercises-error",
            kind: "error",
            message: "Could not load saved exercises.",
            onRetry: () => void refetch(),
          },
        ]
      : favorites.length === 0
        ? [
            {
              key: "exercises-empty",
              kind: "empty",
              message:
                "No saved exercises yet. Search for an exercise and tap the heart to save it.",
              actionLabel: "Search Exercises",
              onAction: goToSearch,
            },
          ]
        : favorites.map((exercise) => ({
            key: `exercise-${exercise.id}`,
            kind: "exercise" as const,
            exercise,
          }));

  const templateRows: SavedRow[] = templatesLoading
    ? [{ key: "templates-loading", kind: "loading", variant: "templates" }]
    : templatesError
      ? [
          {
            key: "templates-error",
            kind: "error",
            message: "Could not load templates.",
            onRetry: () => void refetchTemplates(),
          },
        ]
      : templates.length === 0
        ? [
            {
              key: "templates-empty",
              kind: "empty",
              message: "No workout templates yet. Create one to start faster.",
              actionLabel: "New Template",
              onAction: goToNewTemplate,
            },
          ]
        : templates.map((template) => ({
            key: `template-${template.id}`,
            kind: "template" as const,
            template,
          }));

  const rows = tab === "exercises" ? exerciseRows : templateRows;

  const exerciseCount = !isLoading && !error ? favorites.length : undefined;
  const templateCount =
    !templatesLoading && !templatesError ? templates.length : undefined;

  const isTemplatesTab = tab === "templates";
  const createLabel = isTemplatesTab ? "New Template" : "New Exercise";
  const onCreate = isTemplatesTab ? goToNewTemplate : goToNewExercise;

  return (
    <CustomScreen>
      <View className="mb-3 gap-3">
        <ScreenHeader title="Saved" />

        <Tabs value={tab} onValueChange={(value) => setTab(value as SavedTab)}>
          <TabsList className="w-full">
            <TabsTrigger value="exercises" className="flex-1">
              <Text>Exercises</Text>
              {exerciseCount !== undefined ? (
                <Badge variant="secondary">
                  <Text>{exerciseCount}</Text>
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex-1">
              <Text>Templates</Text>
              {templateCount !== undefined ? (
                <Badge variant="secondary">
                  <Text>{templateCount}</Text>
                </Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </View>

      <FlashList
        data={rows}
        keyExtractor={(row) => row.key}
        getItemType={(row) => row.kind}
        style={{ flex: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListHeaderComponent={
          <View className="mb-2 flex-row justify-end">
            <Button variant="ghost" size="sm" onPress={onCreate}>
              <Text>{createLabel}</Text>
            </Button>
          </View>
        }
        renderItem={({ item }) => {
          switch (item.kind) {
            case "loading":
              return (
                <View className="gap-2">
                  {Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) =>
                    item.variant === "templates" ? (
                      <TemplateSkeleton key={index} />
                    ) : (
                      <ExerciseSkeleton key={index} />
                    ),
                  )}
                </View>
              );
            case "error":
              return (
                <Card className="p-0">
                  <CardContent className="gap-3 p-4">
                    <Text>{item.message}</Text>
                    <Button
                      variant="outline"
                      size="sm"
                      className="self-start"
                      onPress={item.onRetry}
                    >
                      <Text>Retry</Text>
                    </Button>
                  </CardContent>
                </Card>
              );
            case "empty":
              return (
                <Card className="p-0">
                  <CardContent className="gap-3 p-4">
                    <Text variant="muted">{item.message}</Text>
                    <Button
                      variant="outline"
                      size="sm"
                      className="self-start"
                      onPress={item.onAction}
                    >
                      <Text>{item.actionLabel}</Text>
                    </Button>
                  </CardContent>
                </Card>
              );
            case "exercise":
              return (
                <ExerciseCard
                  name={item.exercise.name}
                  category={item.exercise.category}
                  imageUrl={item.exercise.imageUrl}
                  isFavorite
                  source={item.exercise.source}
                  onPress={() =>
                    router.push({
                      pathname: "/exercise/[exerciseId]",
                      params: {
                        exerciseId: item.exercise.id,
                        source: "local",
                      },
                    })
                  }
                  onToggleFavorite={
                    item.exercise.source === "custom"
                      ? undefined
                      : () => setExerciseToRemove(item.exercise)
                  }
                />
              );
            case "template":
              return (
                <TemplateCard
                  template={item.template}
                  onPress={() => {
                    router.push({
                      pathname: "/workout/template/[templateId]",
                      params: { templateId: item.template.id },
                    } as unknown as Href);
                  }}
                  onDelete={() => setTemplateToDelete(item.template)}
                />
              );
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(exerciseToRemove)}
        onOpenChange={(open) => !open && setExerciseToRemove(null)}
        title="Remove from favorites?"
        description={
          exerciseToRemove
            ? `${exerciseToRemove.name} will be removed from favorites.`
            : "This exercise will be removed from favorites."
        }
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          setExerciseToRemove(null);
          void confirmRemoveFavorite();
        }}
      />

      <ConfirmDialog
        open={Boolean(templateToDelete)}
        onOpenChange={(open) => !open && setTemplateToDelete(null)}
        title="Delete template?"
        description={
          templateToDelete
            ? `${templateToDelete.name} will be permanently removed.`
            : "This template will be permanently removed."
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          setTemplateToDelete(null);
          void confirmDeleteTemplate();
        }}
      />
    </CustomScreen>
  );
}
