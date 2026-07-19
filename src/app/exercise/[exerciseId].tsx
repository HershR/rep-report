import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import { Heart } from "lucide-react-native";
import { View } from "react-native";

import { CustomScreen } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FadeInView } from "@/components/ui/fade-in-view";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useFavoriteExercises } from "@/features/exercises/hooks/useFavoriteExercises";
import { getExerciseById } from "@/features/exercises/repositories/exerciseRepository";
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

export default function ExerciseDetailScreen() {
  const params = useLocalSearchParams<{
    exerciseId: string;
    source?: "local" | "wger";
  }>();
  const source = params.source ?? "wger";
  const exerciseId = params.exerciseId;

  const { saveFavoriteExercise, removeFavoriteExercise } =
    useFavoriteExercises();

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
          <Card className="mt-4 gap-0 overflow-hidden p-0">
            {item.imageUrl ? (
              <ExpoImage
                source={{ uri: item.imageUrl }}
                style={{ width: "100%", aspectRatio: 1 }}
                contentFit={"cover"}
                placeholder={blurhash}
              />
            ) : null}

            <CardContent className="gap-3 p-4">
              <View className="flex-row items-center">
                {item.category ? (
                  <Badge variant="secondary">
                    <Text>{item.category}</Text>
                  </Badge>
                ) : null}
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
                      item.isFavorite ? "text-red-500" : "text-muted-foreground"
                    }
                    fill={item.isFavorite ? "currentColor" : "none"}
                  />
                </Button>
              </View>

              {item.description ? (
                <Text variant="muted">{item.description}</Text>
              ) : null}

              <MuscleGroup title="Equipment" muscles={item.equipment} />
              <MuscleGroup
                title="Primary muscles"
                muscles={item.primaryMuscles}
              />
              <MuscleGroup
                title="Secondary muscles"
                muscles={item.secondaryMuscles}
              />
            </CardContent>
          </Card>
        </FadeInView>
      ) : null}
    </CustomScreen>
  );
}
