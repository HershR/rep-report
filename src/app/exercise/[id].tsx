import {
  View,
  Text,
  Image,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchExerciseDetail } from "@/src/services/api";
import useFetch from "@/src/services/useFetch";
import { SafeAreaView } from "react-native-safe-area-context";
import { Muscles } from "@/src/interfaces/interface";
import { removeHTML, toUpperCase } from "@/src/services/textFormatter";
import MuscleCard from "@/src/components/MuscleCard";
import CustomCarousel from "@/src/components/CustomCarousel";
import { SearchChip } from "../../components/SearchChip";
import { icons } from "@/src/constants/icons";
import WorkoutForm from "@/src/components/modals/WorkoutForm";

const ExerciseDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [descriptionLineCount, setDescriptionLineCount] = useState(1);
  const [showDescription, setShowDescription] = useState(false);
  const [showMuscles, setShowMuscles] = useState(false);
  const maxLineCount = 3;
  const { data: exercise, loading } = useFetch(() =>
    fetchExerciseDetail(id as string)
  );
  const { width } = useWindowDimensions();
  const translation = exercise?.translations.find((x) => x.language === 2);
  const name = toUpperCase(translation?.name);
  const desciption = removeHTML(translation?.description);
  const equipment = exercise?.equipment.map((x) => (
    <SearchChip key={x.id} item={x} onPress={() => {}} disabled={false} />
  ));
  const muscles = exercise?.muscles.concat(exercise.muscles_secondary);
  const musclesFront = muscles?.filter((x) => x.is_front);
  const musclesBack = muscles?.filter((x) => !x.is_front);

  const muscleChip = [musclesFront?.[0], musclesBack?.[0]]
    .filter((x) => x !== undefined)
    .map((x) => <SearchChip key={x?.id} item={x} disabled={false} />);

  function toggleShowDescription() {
    setShowDescription((prev) => !prev);
  }
  function openModal() {
    setShowMuscles(true);
  }
  function closeModal() {
    setShowMuscles(false);
  }
  return (
    <View className="flex-1 bg-secondary">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size={"large"} className="mt-10 self-center" />
        </View>
      ) : (
        <SafeAreaView className="flex-1 mx-4 mt-8 relative">
          <TouchableOpacity
            className="self-start justify-center items-center bg-transparent rounded-full px-2 py-2 border-accent border-2"
            onPress={router.back}
          >
            <Image
              source={icons.arrow}
              className="size-5 rotate-180"
              tintColor={"#2b2e3d"}
            />
          </TouchableOpacity>
          <ScrollView
            className="flex-1 px-5 mt-3"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
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
                  renderFunction={(item: string, index?: number) => {
                    return (
                      <View className="flex-1 justify-center items-center">
                        <Image
                          source={{
                            uri: item,
                          }}
                          className="rounded-lg aspect-square w-full bg-gray-300"
                          resizeMode="cover"
                        />
                      </View>
                    );
                  }}
                />
              </View>
            )}
            <Text className="text-primary text-4xl font-bold mt-4">{name}</Text>
            <View className="flex-row gap-2">
              {exercise?.category !== undefined && (
                <SearchChip item={exercise.category} disabled={false} />
              )}
              {muscleChip}
            </View>
            <>
              <Text
                numberOfLines={showDescription ? undefined : maxLineCount}
                className="text-light text-gr text-xl"
                onTextLayout={(e) => {
                  if (descriptionLineCount < maxLineCount)
                    setDescriptionLineCount(e.nativeEvent.lines.length);
                }}
              >
                {desciption}
              </Text>
              {descriptionLineCount > maxLineCount && (
                <TouchableOpacity onPress={toggleShowDescription}>
                  <Text className="text-light text-lg font-bold">
                    {showDescription ? "Show Less" : "Show More"}
                  </Text>
                </TouchableOpacity>
              )}
            </>
            {equipment !== undefined && equipment.length > 0 && (
              <View className="flex-row justify-start items-center gap-1">
                <Text>Equipment: </Text>
                {equipment !== undefined && equipment}
              </View>
            )}
            <TouchableOpacity className="flex flex-row items-center justify-center bg-accent rounded-lg py-3.5 my-5">
              <Text className="text-secondary font-semibold text-base">
                Start
              </Text>
              <Image
                source={icons.arrow}
                className="size-5 ml-1 mt-0.5"
                tintColor={"#fff"}
              />
            </TouchableOpacity>
            {muscles !== undefined && muscles.length > 0 && (
              <View className="flex mt-2 justify-center">
                <TouchableOpacity
                  className="flex"
                  onPress={() => setShowMuscles((prev) => !prev)}
                >
                  <Text className="text-primary font-bold text-xl">
                    {`Targeted Muscles ${showMuscles ? " ^" : " V"}`}
                  </Text>
                </TouchableOpacity>
                {showMuscles && (
                  <View className="flex-1 items-center mt-4">
                    <CustomCarousel
                      width={width}
                      height={width}
                      loop={false}
                      data={[musclesFront, musclesBack].filter(
                        (x) => !!x && x.length > 0
                      )}
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
                  </View>
                )}
              </View>
            )}
          </ScrollView>
          <WorkoutForm exercise={exercise} date={""} />
        </SafeAreaView>
      )}
    </View>
  );
};

export default ExerciseDetails;
