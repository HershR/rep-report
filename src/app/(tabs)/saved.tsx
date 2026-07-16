import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { FlashList } from "@shopify/flash-list";

import { CustomScreen } from "@/components/common";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { ExerciseCard } from "@/features/exercises/components/ExerciseCard";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import type { Exercise } from "@/features/exercises/types";
import { TemplateCard } from "@/features/templates/components/TemplateCard";
import { useWorkoutTemplates } from "@/features/templates/hooks/useWorkoutTemplates";
import type { WorkoutTemplate } from "@/features/templates/types";
import { THEME } from "@/lib/theme";

type SavedRow =
  | { key: string; kind: "section-header"; title: string; count?: number; action?: { label: string; onPress: () => void } }
  | { key: string; kind: "loading" }
  | { key: string; kind: "error"; message: string }
  | { key: string; kind: "empty"; message: string }
  | { key: string; kind: "exercise"; exercise: Exercise }
  | { key: string; kind: "template"; template: WorkoutTemplate };

export default function SavedScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = THEME[scheme ?? "light"];
  const { favorites, isLoading, error, removeFavoriteExercise } =
    useFavoriteExercises();
  const {
    templates,
    isLoading: templatesLoading,
    error: templatesError,
    deleteWorkoutTemplate,
  } = useWorkoutTemplates();
  const [exerciseToRemove, setExerciseToRemove] = useState<Exercise | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<WorkoutTemplate | null>(null);

  const confirmRemoveFavorite = async () => {
    if (!exerciseToRemove) return;
    await removeFavoriteExercise({ id: exerciseToRemove.id });
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;
    await deleteWorkoutTemplate(templateToDelete.id);
  };

  const rows: SavedRow[] = [
    {
      key: "exercises-header",
      kind: "section-header",
      title: "Saved Exercises",
      count: !isLoading && !error ? favorites.length : undefined,
    },
    ...(isLoading
      ? [{ key: "exercises-loading", kind: "loading" } as const]
      : error
        ? [{ key: "exercises-error", kind: "error", message: "Could not load saved exercises." } as const]
        : favorites.length === 0
          ? [
              {
                key: "exercises-empty",
                kind: "empty",
                message: "No saved exercises yet. Search and tap Favorite.",
              } as const,
            ]
          : favorites.map((exercise) => ({ key: `exercise-${exercise.id}`, kind: "exercise" as const, exercise }))),
    {
      key: "templates-header",
      kind: "section-header",
      title: "Workout Templates",
      count: !templatesLoading && !templatesError ? templates.length : undefined,
      action: { label: "Create New", onPress: () => router.push("/workout/template/new" as Href) },
    },
    ...(templatesLoading
      ? [{ key: "templates-loading", kind: "loading" } as const]
      : templatesError
        ? [{ key: "templates-error", kind: "error", message: "Could not load templates." } as const]
        : templates.length === 0
          ? [
              {
                key: "templates-empty",
                kind: "empty",
                message: "No workout templates yet. Create one to start faster.",
              } as const,
            ]
          : templates.map((template) => ({ key: `template-${template.id}`, kind: "template" as const, template }))),
  ];

  return (
    <CustomScreen>
      <FlashList
        data={rows}
        keyExtractor={(row) => row.key}
        getItemType={(row) => row.kind}
        style={{ flex: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListHeaderComponent={
          <View className="mb-2">
            <Text variant="h2">Saved</Text>
            <Text variant="muted">Manage saved exercises and templates.</Text>
          </View>
        }
        renderItem={({ item }) => {
          switch (item.kind) {
            case "section-header":
              return (
                <View className="flex-row items-center gap-2 pb-2 pt-4">
                  <Text variant="large">{item.title}</Text>
                  {item.count !== undefined ? (
                    <Badge variant="secondary">
                      <Text>{item.count}</Text>
                    </Badge>
                  ) : null}
                  {item.action ? (
                    <Button variant="ghost" size="sm" className="ml-auto" onPress={item.action.onPress}>
                      <Text>{item.action.label}</Text>
                    </Button>
                  ) : null}
                </View>
              );
            case "loading":
              return (
                <View className="items-center py-4">
                  <ActivityIndicator color={colors.primary} />
                </View>
              );
            case "error":
              return (
                <Card>
                  <CardContent>
                    <Text>{item.message}</Text>
                  </CardContent>
                </Card>
              );
            case "empty":
              return (
                <Card>
                  <CardContent>
                    <Text variant="muted">{item.message}</Text>
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
                  onPress={() =>
                    router.push({
                      pathname: "/exercise/[exerciseId]",
                      params: {
                        exerciseId: item.exercise.id,
                        source: "local",
                      },
                    })
                  }
                  onToggleFavorite={() => setExerciseToRemove(item.exercise)}
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
