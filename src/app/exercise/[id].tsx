import {
  View,
  Image,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import React, { useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchExerciseDetail } from "@/src/services/api";
import useFetch from "@/src/services/useFetch";
import { SafeAreaView } from "react-native-safe-area-context";
import { Muscles, Workout } from "@/src/interfaces/interface";
import { removeHTML, toUpperCase } from "@/src/services/textFormatter";
import MuscleCard from "@/src/components/MuscleCard";
import CustomCarousel from "@/src/components/CustomCarousel";
import { SearchChip } from "@/src/components/SearchChip";
import WorkoutForm from "@/src/components/WorkoutForm";
import { useDate } from "@/src/context/DateContext";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/src/db/schema";
import { addSetToWorkout, createWorkoutWithExercise } from "@/src/db/dbHelpers";
import { Text } from "@/src/components/ui/text";
import { ArrowRight } from "@/src/lib/icons/ArrowRight";
import { Button } from "@/src/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

const ExerciseDetails = () => {
  const router = useRouter();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const { selectedDate, setSelectedDate } = useDate();

  const { id }: { id: string } = useLocalSearchParams();
  const { width } = useWindowDimensions();

  const scrollViewRef = useRef<ScrollView>(null);
  const [descriptionLineCount, setDescriptionLineCount] = useState(1);
  const [showDescription, setShowDescription] = useState(false);
  const [showMuscles, setShowMuscles] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const maxLineCount = 3;

  const { data: exercise, loading } = useFetch(() => fetchExerciseDetail(id));

  const translation = exercise?.translations.find((x) => x.language === 2);
  const name = toUpperCase(translation?.name);
  const desciption = removeHTML(translation?.description);
  const equipment = exercise?.equipment.map((x) => (
    <SearchChip key={x.id} item={x} onPress={() => {}} disabled={false} />
  ));
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
      <SearchChip key={item.id.toString()} item={item} disabled={true} />
    ));
  };

  function toggleShowDescription() {
    setShowDescription((prev) => !prev);
  }

  async function saveWorkout(workoutForm: Workout) {
    console.log("Save Workout ", workoutForm);
    const workoutID = await createWorkoutWithExercise(drizzleDb, {
      ...workoutForm,
    });
    for (let index = 0; index < workoutForm.sets.length; index++) {
      let element = workoutForm.sets[index];
      if (workoutForm.mode === 0) {
        element = {
          ...element,
          duration: undefined,
          weight: element.weight || 0,
          reps: element.reps || 1,
        };
      } else {
        element = {
          ...element,
          weight: undefined,
          reps: undefined,
          duration: element.duration || "00:00:00",
        };
      }
      await addSetToWorkout(drizzleDb, {
        ...element,
        workout_id: workoutID,
        order: index,
      });
    }
  }

  return (
    <View className="flex-1 bg-secondary">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size={"large"} className="mt-10 self-center" />
        </View>
      ) : (
        <SafeAreaView className="flex-1 mx-4 relative">
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-5 mt-3"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
          >
            <Button variant={"ghost"} size={"icon"} onPress={router.back}>
              <ArrowRight size={32} className="rotate-180 color-primary mb-4" />
            </Button>
            {exercise?.images !== undefined && exercise.images.length > 0 && (
              <View className="flex items-center">
                <CustomCarousel
                  width={350}
                  height={350}
                  loop={false}
                  data={exercise?.images.map((x) => x.image)}
                  dotStyle={{
                    backgroundColor: "#9ca3af",
                    borderRadius: 50,
                    overflow: "hidden",
                  }}
                  activeDotStyle={{
                    borderRadius: 100,
                    overflow: "hidden",
                    backgroundColor: "#2A2E3C",
                  }}
                  renderFunction={(item: string, index?: number) => {
                    return (
                      <View className="flex-1 justify-center items-center">
                        <Image
                          source={{
                            uri: item,
                          }}
                          className="rounded-lg aspect-square w-full bg-background"
                          resizeMode="contain"
                        />
                      </View>
                    );
                  }}
                />
              </View>
            )}
            <Text className="text-2xl font-bold mt-4 mb-2">{name}</Text>
            <View className="flex-row flex-wrap gap-2">{chipItems()}</View>
            <>
              <Text
                numberOfLines={showDescription ? undefined : maxLineCount}
                className="text-primary text-xl"
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
            </>
            {/* {!showForm && (
              <Button
                onPress={() => setShowForm(true)}
                className="items-center justify-center"
              >
                <Text>Start Workout</Text>
              </Button>
            )}
            {showForm && (
              <WorkoutForm
                date={selectedDate?.toISODate()!}
                exerciseId={id}
                exerciseName={name}
                exerciseCategory={exercise!.category.name}
                mode={"weight"}
                onSubmit={saveWorkout}
              />
            )} */}
            {muscles !== undefined && muscles.length > 0 && (
              <Accordion
                type="single"
                collapsible
                className="w-full max-w-sm native:max-w-md mt-4 mb-12"
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
                  <AccordionContent className="justify-center items-center">
                    <CustomCarousel
                      width={width}
                      height={Math.min(500, width)}
                      loop={false}
                      data={allMuscles}
                      dotStyle={{
                        backgroundColor: "#9ca3af",
                        borderRadius: 50,
                        overflow: "hidden",
                      }}
                      activeDotStyle={{
                        borderRadius: 100,
                        overflow: "hidden",
                        backgroundColor: "#2A2E3C",
                      }}
                      renderFunction={(item: Muscles[], index?: number) => {
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
            )}
          </ScrollView>

          <Button
            onPress={() => console.log("Show Workout Page")}
            className="absolute w-full bottom-10 items-center justify-center"
          >
            <Text>Start Workout</Text>
          </Button>
        </SafeAreaView>
      )}
    </View>
  );
};

export default ExerciseDetails;
