import { View, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchExerciseDetail } from "@/src/services/api";
import useFetch from "@/src/services/useFetch";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import { removeHTML, toUpperCase } from "@/src/services/textFormatter";
import MuscleCard from "@/src/components/MuscleCard";
import CustomCarousel from "@/src/components/CustomCarousel";
import { SearchChip } from "@/src/components/SearchChip";
import { Text } from "@/src/components/ui/text";
import { Star } from "@/src/lib/icons/Star";
import { Button } from "@/src/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import ExerciseImage from "@/src/components/ExerciseImage";
import {
  getExerciseById,
  setFavoriteExercise,
  getOrCreateExercise,
} from "@/src/db/dbHelpers";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/src//db/schema";
import { useSQLiteContext } from "expo-sqlite";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import ActivityLoader from "@/src/components/ActivityLoader";
import { useColorScheme } from "@/src/lib/useColorScheme";
import { NAV_THEME } from "@/src/lib/constants";
const ExerciseDetails = () => {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const { colorScheme } = useColorScheme();
  const { width, height } = useSafeAreaFrame();
  const [isFavorite, setIsFavorite] = useState(false);
  const [descriptionLineCount, setDescriptionLineCount] = useState(1);
  const [showDescription, setShowDescription] = useState(false);
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const { id }: { id: string } = useLocalSearchParams();

  const maxLineCount = 3;

  const { data: exercise, loading } = useFetch(() => fetchExerciseDetail(id));

  const translation = exercise?.translations.find((x) => x.language === 2);
  const name = toUpperCase(translation?.name);
  const desciption = removeHTML(translation?.description);
  const muscles = exercise?.muscles.concat(exercise.muscles_secondary);
  const musclesFront = muscles?.filter((x) => x.is_front);
  const musclesBack = muscles?.filter((x) => !x.is_front);
  const allMuscles = [musclesFront, musclesBack].filter(
    (x) => !!x && x.length > 0
  );
  const chipItems = () => {
    const items: { id: number; name: string }[] = [];
    if (!!exercise?.category) {
      items.push(exercise.category);
    }
    if (!!musclesFront && !!musclesFront[0]) {
      items.push(musclesFront[0]);
    }
    if (!!musclesBack && !!musclesBack[0]) {
      items.push(musclesBack[0]);
    }
    if (!!exercise?.equipment && exercise.equipment.length > 0) {
      exercise.equipment.forEach((x) => {
        if (x.id !== 7) items.push(x);
      });
    }
    return items.map((item) => (
      <SearchChip key={item.name} item={item} disabled={true} />
    ));
  };

  useEffect(() => {
    async function fetchExercise() {
      if (id !== null && id !== undefined) {
        await getExerciseById(drizzleDb, parseInt(id)).then((ex) => {
          if (ex !== undefined) {
            setIsFavorite(ex.is_favorite || false);
          }
        });
      }
    }
    fetchExercise();
  }, [id]);

  function toggleShowDescription() {
    setShowDescription((prev) => !prev);
  }

  async function toggleFavorite() {
    if (exercise && loading === false) {
      try {
        const exercise_id = await getOrCreateExercise(drizzleDb, parseInt(id));
        await setFavoriteExercise(drizzleDb, exercise_id, !isFavorite);
        setIsFavorite((prev) => !prev);
      } catch (err) {
        console.log("Failed to update favorite: ", err);
      }
    }
  }

  return (
    <SafeAreaWrapper>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityLoader />
        </View>
      ) : (
        <>
          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            showsVerticalScrollIndicator={false}
          >
            {exercise?.images !== undefined && exercise.images.length > 0 && (
              <View className="flex justify-center items-center">
                <CustomCarousel
                  width={Math.min(height * 0.5, width - 64)}
                  height={Math.min(height * 0.5, width - 64)}
                  data={exercise?.images.map((x) => x.image)}
                  renderItem={(item: string) => {
                    return (
                      <View className="flex-1 justify-center m-2 mt-0 items-center">
                        <ExerciseImage
                          image_uri={item}
                          containerClassname="w-full aspect-square"
                          contextFit="contain"
                        />
                      </View>
                    );
                  }}
                />
              </View>
            )}
            {/* Name */}
            <View className="flex-row justify-between items-start my-2">
              <Text className="flex-1 text-2xl font-bold text-left">
                {name}
              </Text>
              <Button
                variant={"ghost"}
                size={"icon"}
                onPress={async () => toggleFavorite()}
              >
                <Star
                  className="color-primary"
                  fill={
                    isFavorite ? NAV_THEME[colorScheme].primary : "transparent"
                  }
                />
              </Button>
            </View>
            {/* Chip */}
            <View className="flex-row flex-wrap items-center gap-2">
              {chipItems()}
            </View>
            {/* Description */}
            <Text
              numberOfLines={showDescription ? undefined : maxLineCount}
              className="text-primary text-xl mt-2"
              onTextLayout={(e) => {
                if (
                  descriptionLineCount < e.nativeEvent.lines.length &&
                  descriptionLineCount < maxLineCount
                )
                  setDescriptionLineCount(e.nativeEvent.lines.length);
              }}
            >
              {desciption}
            </Text>
            {descriptionLineCount > maxLineCount && (
              <TouchableOpacity onPress={toggleShowDescription}>
                <Text className="text-lg font-bold">
                  {showDescription ? "Show Less" : "Show More"}
                </Text>
              </TouchableOpacity>
            )}
            {/* Muscle Groups */}
            {muscles !== undefined && muscles.length > 0 && width < 700 ? (
              <Accordion
                type="single"
                collapsible
                className="w-full max-w-sm native:max-w-md mt-2"
                onValueChange={(val) => {
                  if (!!val) {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  } else {
                    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                  }
                }}
              >
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    <Text>Targeted Muscles</Text>
                  </AccordionTrigger>
                  <AccordionContent
                    className="items-center"
                    forceMount={exercise?.images.length == 0 || undefined}
                  >
                    <CustomCarousel
                      width={300}
                      height={425}
                      loop={false}
                      //@ts-ignore
                      data={allMuscles}
                      renderItem={(item: Muscles[]) => {
                        return (
                          <MuscleCard
                            muscleList={item}
                            isFront={!!item && item[0]?.is_front}
                          />
                        );
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <View className="flex-row mt-4 mb-4">
                <MuscleCard muscleList={musclesFront} isFront={true} />
                <MuscleCard muscleList={musclesBack} isFront={false} />
              </View>
            )}
          </ScrollView>
          <Button
            className="w-full items-center justify-center"
            onPress={() =>
              router.push({
                pathname: "../workout/create/[id]",
                params: {
                  id: 0,
                  exerciseId: id,
                  exerciseName: name,
                },
              })
            }
          >
            <Text>Start Workout</Text>
          </Button>
        </>
      )}
    </SafeAreaWrapper>
  );
};

export default ExerciseDetails;
