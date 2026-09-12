import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Plus } from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";

import { CustomScreen } from "@/components/common";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { ExerciseRow } from "@/features/exercises/components/ExerciseRow";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import type { Exercise } from "@/features/exercises/types";
import { TemplateCard } from "@/features/templates/components/TemplateCard";
import { useWorkoutTemplates } from "@/features/templates/hooks/useWorkoutTemplates";
import type { WorkoutTemplate } from "@/features/templates/types";
import { THEME } from "@/lib/theme";

type SavedTab = "exercises" | "templates";

type SavedRow =
  | { key: string; kind: "loading" }
  | { key: string; kind: "error"; message: string }
  | { key: string; kind: "empty"; message: string }
  | { key: string; kind: "exercise"; exercise: Exercise }
  | { key: string; kind: "template"; template: WorkoutTemplate };

export default function SavedScreen() {
  const router = useRouter();
  const colors = THEME;
  const [tab, setTab] = useState<SavedTab>("exercises");
  const { favorites, isLoading, error, removeFavoriteExercise } =
    useFavoriteExercises();
  const {
    templates,
    isLoading: templatesLoading,
    error: templatesError,
    deleteWorkoutTemplate,
  } = useWorkoutTemplates();
  const [exerciseToRemove, setExerciseToRemove] = useState<Exercise | null>(
    null,
  );
  const [templateToDelete, setTemplateToDelete] =
    useState<WorkoutTemplate | null>(null);

  const confirmRemoveFavorite = async () => {
    if (!exerciseToRemove) return;
    await removeFavoriteExercise({ id: exerciseToRemove.id });
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;
    await deleteWorkoutTemplate(templateToDelete.id);
  };

  const exerciseRows: SavedRow[] = isLoading
    ? [{ key: "exercises-loading", kind: "loading" }]
    : error
      ? [
          {
            key: "exercises-error",
            kind: "error",
            message: "Could not load saved exercises.",
          },
        ]
      : favorites.length === 0
        ? [
            {
              key: "exercises-empty",
              kind: "empty",
              message: "No saved exercises yet. Search and tap Favorite.",
            },
          ]
        : favorites.map((exercise) => ({
            key: `exercise-${exercise.id}`,
            kind: "exercise" as const,
            exercise,
          }));

  const templateRows: SavedRow[] = templatesLoading
    ? [{ key: "templates-loading", kind: "loading" }]
    : templatesError
      ? [
          {
            key: "templates-error",
            kind: "error",
            message: "Could not load templates.",
          },
        ]
      : templates.length === 0
        ? [
            {
              key: "templates-empty",
              kind: "empty",
              message: "No workout templates yet. Create one to start faster.",
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

  return (
    <CustomScreen>
      <View className="mb-3 gap-3">
        <Text variant="screenTitle" className="h-9">
          Saved
        </Text>

        <Tabs value={tab} onValueChange={(value) => setTab(value as SavedTab)}>
          <TabsList className="w-full">
            <TabsTrigger value="exercises" className="flex-1">
              <Text>Exercises</Text>
              {exerciseCount !== undefined ? (
                <Text variant="meta" className="text-text-3">
                  {exerciseCount}
                </Text>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex-1">
              <Text>Templates</Text>
              {templateCount !== undefined ? (
                <Text variant="meta" className="text-text-3">
                  {templateCount}
                </Text>
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
        ItemSeparatorComponent={() =>
          tab === "templates" ? <View style={{ height: 10 }} /> : null
        }
        ListHeaderComponent={
          <Button
            variant="outline"
            className="border-border-strong mb-3 h-[50px] border-dashed bg-transparent"
            onPress={() =>
              router.push(
                (tab === "templates"
                  ? "/workout/template/new"
                  : "/exercise/new") as Href,
              )
            }
          >
            <Icon as={Plus} className="text-primary size-4" />
            <Text className="text-primary">
              {tab === "templates" ? "New template" : "New exercise"}
            </Text>
          </Button>
        }
        renderItem={({ item, index }) => {
          switch (item.kind) {
            case "loading":
              return (
                <View className="items-center py-4">
                  <ActivityIndicator color={colors.primary} />
                </View>
              );
            case "error":
              return (
                <Text className="text-destructive py-6 text-center text-sm">
                  {item.message}
                </Text>
              );
            case "empty":
              return (
                <Text className="text-text-3 py-8 text-center text-sm">
                  {item.message}
                </Text>
              );
            case "exercise":
              return (
                <ExerciseRow
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
                  marker={String.fromCharCode(65 + index)}
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
