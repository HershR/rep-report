import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  FlatList,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchExerciseDetail } from "@/src/services/api";
import useFetch from "@/src/services/useFetch";
import { SafeAreaView, useSafeAreaFrame } from "react-native-safe-area-context";
import { removeHTML, toUpperCase } from "@/src/services/textFormatter";
import MuscleCard from "@/src/components/MuscleCard";
import CustomCarousel from "@/src/components/CustomCarousel";
import { SearchChip } from "@/src/components/SearchChip";
import { Text } from "@/src/components/ui/text";
import { ArrowRight } from "@/src/lib/icons/ArrowRight";
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
  createExercise,
  getExerciseById,
  setFavoriteExercise,
} from "@/src/db/dbHelpers";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/src//db/schema";
import { useSQLiteContext } from "expo-sqlite";
import { useTheme } from "@react-navigation/native";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";

const ExerciseDetails = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const { width, height } = useSafeAreaFrame();
  const [isFavorite, setIsFavorite] = useState(false);
  const [descriptionLineCount, setDescriptionLineCount] = useState(1);
  const [showDescription, setShowDescription] = useState(false);
  console.log(width, height);
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
      await getExerciseById(drizzleDb, parseInt(id)).then((ex) => {
        if (ex === undefined) {
          createExercise(drizzleDb, {
            id: exercise.id,
            name: translation?.name || "",
            category: exercise.category.name,
            image: exercise.images.length > 0 ? exercise.images[0].image : null,
            is_favorite: true,
          });
        } else {
          setFavoriteExercise(drizzleDb, ex.id, !isFavorite);
        }
      });
      setIsFavorite((prev) => !prev);
    }
  }

  return (
    <SafeAreaWrapper style="mt-5">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size={"large"} className="mt-10 self-center" />
        </View>
      ) : (
        <>
          <Button variant={"ghost"} size={"icon"} onPress={router.back}>
            <ArrowRight size={32} className="rotate-180 color-primary" />
          </Button>
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
                  renderFunction={(item: string) => {
                    return (
                      <View className="flex-1 m-2 justify-center items-center">
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
            <View className="flex-row justify-between items-center  my-2">
              <Text className="flex-1 text-2xl font-bold text-left">
                {name}
              </Text>
              <Button
                variant={"ghost"}
                size={"icon"}
                onPress={async () => toggleFavorite()}
              >
                <Star className="color-primary" />
                {isFavorite || false ? (
                  <Star className="absolute " fill={colors.primary} />
                ) : null}
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
                  <AccordionContent className="items-center">
                    <CustomCarousel
                      width={300}
                      height={425}
                      loop={false}
                      data={allMuscles}
                      renderFunction={(item: Muscles[]) => {
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
                pathname: "../workout/[id]",
                params: {
                  id: -1,
                  exerciseId: id,
                  exerciseName: name,
                  formMode: 0,
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
