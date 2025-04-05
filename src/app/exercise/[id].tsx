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
import { Category, Equipment, Muscles } from "@/src/interfaces/interface";
import { removeHTML, toCamelCase } from "@/src/services/textFormatter";
import MuscleCard from "@/src/components/MuscleCard";
import CustomCarousel from "@/src/components/CustomCarousel";
import { SearchChip } from "../../components/SearchChip";

const ExerciseDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [showDescription, setShowDescription] = useState(false);
  const { data: exercise, loading } = useFetch(() =>
    fetchExerciseDetail(id as string)
  );
  const { width } = useWindowDimensions();
  const translation = exercise?.translations.find((x) => x.language === 2);
  const name = toCamelCase(translation?.name);
  const desciption = removeHTML(translation?.description);
  const equipment = exercise?.equipment.map((x) => (
    <SearchChip key={x.id} {...x} />
  ));
  const muscles = exercise?.muscles.concat(exercise.muscles_secondary);
  const musclesFront = muscles?.filter((x) => x.is_front);
  const musclesBack = muscles?.filter((x) => !x.is_front);

  const muscleChip = [musclesFront?.[0], musclesBack?.[0]]
    .filter((x) => x !== undefined)
    .map((x) => <SearchChip key={x?.id} {...x} />);

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
        <SafeAreaView className="flex-1 mx-4 mt-8">
          <ScrollView
            className="flex-1 px-5"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
          >
            {exercise?.images !== undefined && exercise.images.length > 0 && (
              <View className="flex-1 items-center">
                <CustomCarousel
                  width={350}
                  height={450}
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
                          className="rounded-lg aspect-[7/9] w-full bg-accent"
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
                <SearchChip {...exercise?.category!} />
              )}
              {muscleChip}
            </View>
            <Text
              numberOfLines={showDescription ? undefined : 3}
              className="text-light text-gr text-xl"
            >
              {desciption}
            </Text>
            <TouchableOpacity onPress={toggleShowDescription}>
              <Text className="text-light text-lg font-bold">
                {showDescription ? "Show Less" : "Show More"}
              </Text>
            </TouchableOpacity>
            {equipment !== undefined && equipment.length > 0 && (
              <View className="flex-row justify-start items-center gap-1">
                <Text>Equipment: </Text>
                {equipment !== undefined && equipment}
              </View>
            )}
            {muscles !== undefined && muscles.length > 0 && (
              <View className="flex-1 mt-2 justify-center">
                <Text className="text-primary font-bold text-xl">
                  Targeted Muscles
                </Text>
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
              </View>
            )}
          </ScrollView>
          <TouchableOpacity className="w-24 h-14 mb-4 rounded-md bg-accent absolute bottom-5 right-4 justify-center items-center">
            <Text className="text-secondary text-xl text-center">Start</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  );
};

export default ExerciseDetails;
