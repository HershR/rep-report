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
      <SafeAreaView className="flex-1 mx-8 my-10 border-2">
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
            className="w-full h-[400px] rounded-lg bg-accent"
            resizeMode="cover"
          />
          <Text className="text-primary text-4xl font-bold mt-4">{name}</Text>
          <Text
            numberOfLines={showDescription ? undefined : 3}
            className="text-gray-500 text-xl"
          >
            {desciption}
          </Text>
          <TouchableOpacity onPress={toggleShowDescription}>
            <Text>{showDescription ? "Show Less" : "Show More"}</Text>
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
                    backgroundColor: "rgba(0,0,0,0.2)",
                    borderRadius: 50,
                  }}
                  renderItem={function (item: any, index?: number) {
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
        <TouchableOpacity className="w-24 h-14 rounded-full bg-accent absolute bottom-5 right-4 justify-center items-center">
          <Text className="text-secondary text-xl font-bold">Add</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default ExerciseDetails;
