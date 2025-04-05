import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchExerciseDetail } from "@/src/services/api";
import useFetch from "@/src/services/useFetch";
import { SafeAreaView } from "react-native-safe-area-context";
import { TranslationBaseInfo } from "@/src/interfaces/interface";
import { removeHTML, toCamelCase } from "@/src/services/textFormatter";
import { SvgUri } from "react-native-svg";
import MuscleCard from "@/src/components/MuscleCard";
import CustomCarousel from "@/src/components/CustomCarousel";

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
  const equipment = exercise?.equipment.map((x) => x.name).join(" ");
  const muscles = exercise?.muscles.concat(exercise.muscles_secondary);
  const musclesFront = muscles?.filter((x) => x.is_front);
  const musclesBack = muscles?.filter((x) => !x.is_front);

  function toggleShowDescription() {
    setShowDescription((prev) => !prev);
  }

  return (
    <View className="flex-1 bg-secondary">
      <SafeAreaView className="flex-1 mx-4 mt-8">
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
        >
          <Image
            source={{
              uri:
                (exercise?.images.length || 0) > 0
                  ? exercise?.images[0].image
                  : undefined,
            }}
            className="rounded-lg aspect-[7/9] w-full bg-accent"
            resizeMode="cover"
          />
          <Text className="text-primary text-4xl font-bold mt-4">{name}</Text>
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
          {!!equipment && (
            <View className="flex-row mt-4">
              <Text className="text-primary text-xl font-bold">
                Equipment: {equipment}
              </Text>
            </View>
          )}
          {!!muscles && muscles.length > 0 && (
            <View className="flex-1 mt-2 justify-center">
              <Text className="text-primary font-bold text-xl">
                Targeted Muscles
              </Text>
              <View className="flex-1 items-center mt-4">
                <CustomCarousel
                  width={width}
                  height={width}
                  loop={false}
                  data={[musclesFront, musclesBack]}
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
                  renderFunction={function (item: any, index?: number) {
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
        <TouchableOpacity className="w-24 h-14 mb-4 rounded-full bg-accent absolute bottom-5 right-4 justify-center items-center">
          <Text className="text-secondary text-md font-bold text-center">
            Start Exercise
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default ExerciseDetails;
