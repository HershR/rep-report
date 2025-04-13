import {
  View,
  Image,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchExerciseDetail } from "@/src/services/api";
import useFetch from "@/src/services/useFetch";
import { SafeAreaView } from "react-native-safe-area-context";
import { removeHTML, toUpperCase } from "@/src/services/textFormatter";
import MuscleCard from "@/src/components/MuscleCard";
import CustomCarousel from "@/src/components/CustomCarousel";
import { SearchChip } from "@/src/components/SearchChip";
import { Text } from "@/src/components/ui/text";
import { ArrowRight } from "@/src/lib/icons/ArrowRight";
import { Button } from "@/src/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import ExerciseImage from "@/src/components/ExerciseImage";

const ExerciseDetails = () => {
  const router = useRouter();

  const { id }: { id: string } = useLocalSearchParams();
  const { width } = useWindowDimensions();

  const scrollViewRef = useRef<ScrollView>(null);
  const [descriptionLineCount, setDescriptionLineCount] = useState(1);
  const [showDescription, setShowDescription] = useState(false);
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

  function toggleShowDescription() {
    setShowDescription((prev) => !prev);
  }

  return (
    <View className="flex-1 bg-secondary">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size={"large"} className="mt-10 self-center" />
        </View>
      ) : (
        <SafeAreaView className="flex-1 mx-4 my-4 gap-y-4">
          <Button variant={"ghost"} size={"icon"} onPress={router.back}>
            <ArrowRight size={32} className="rotate-180 color-primary" />
          </Button>
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 mx-4"
            showsVerticalScrollIndicator={false}
          >
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
                  renderFunction={(item: string) => {
                    return (
                      <View className="flex-1 justify-center items-center">
                        <ExerciseImage
                          image_uri={item}
                          imageClassname={
                            "aspect-square w-full rounded-md bg-white"
                          }
                          textClassname={""}
                        />
                      </View>
                    );
                  }}
                />
              </View>
            )}
            <Text className="text-2xl font-bold mt-4 mb-2">{name}</Text>
            <View className="flex-row flex-wrap items-center gap-2">
              {chipItems()}
            </View>
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
            {muscles !== undefined && muscles.length > 0 && (
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
                  <AccordionContent className="flex-1 justify-center items-center">
                    <CustomCarousel
                      width={300}
                      height={425}
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
            )}
          </ScrollView>

          <Button
            className="w-full items-center justify-center"
            onPress={() =>
              router.push({
                pathname: "../workout/[id]",
                params: { id: -1, exerciseId: id, exerciseName: name },
              })
            }
          >
            <Text>Start Workout</Text>
          </Button>
        </SafeAreaView>
      )}
    </View>
  );
};

export default ExerciseDetails;
