import { View, Text, Image, FlatList, ScrollView } from "react-native";
import React, { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchExerciseDetail } from "@/src/services/api";
import useFetch from "@/src/services/useFetch";
import { SafeAreaView } from "react-native-safe-area-context";
import { TranslationBaseInfo } from "@/src/interfaces/interface";
import { removeHTML, toCamelCase } from "@/src/services/textFormatter";
import { SvgUri } from "react-native-svg";
import MuscleCard from "@/src/components/MuscleCard";
import Carousel from "react-native-reanimated-carousel";

const ExerciseDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { data: exercise, loading } = useFetch(() =>
    fetchExerciseDetail(id as string)
  );

  const translation = exercise?.translations.find((x) => x.language === 2);
  const name = toCamelCase(translation?.name);
  const desciption = removeHTML(translation?.description);
  const equipment = exercise?.equipment.map((x) => x.name).join(" ");
  const muscles = exercise?.muscles.concat(exercise.muscles_secondary);
  const musclesFront = muscles?.filter((x) => x.is_front);
  const musclesBack = muscles?.filter((x) => !x.is_front);
  return (
    <View className="flex-1 bg-secondary">
      <SafeAreaView className="flex-1 mx-8 my-10">
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
          <Text className="text-gray-500 text-xl">{desciption}</Text>
          {!!equipment && (
            <View className="flex-row mt-4">
              <Text className="text-primary text-xl font-bold">
                Equipment: {equipment}
              </Text>
            </View>
          )}
          {!!muscles && muscles.length > 0 && (
            <View className="flex mt-2">
              <Text className="text-primary font-bold text-xl">
                Targeted Muscles
              </Text>
              <MuscleCard muscleList={musclesFront} isFront={true}></MuscleCard>
              <MuscleCard muscleList={musclesBack} isFront={false}></MuscleCard>
              {/* <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4 mt-3"
                contentContainerStyle={{ gap: 26 }}
                ItemSeparatorComponent={() => <View className="w-4" />}
                data={[musclesFront, musclesBack]}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => {
                  if (item == undefined || item.length == 0) {
                    return null;
                  }
                  const base = item[0].is_front ? (
                    <SvgUri
                      uri={`https://wger.de/static/react/muscles/muscular_system_front.svg`}
                    ></SvgUri>
                  ) : (
                    <SvgUri
                      uri={
                        "https://wger.de/static/react/muscles/muscular_system_back.svg"
                      }
                    ></SvgUri>
                  );
                  const child = item.map((x, index) => (
                    <View key={x.name} className="absolute">
                      <SvgUri
                        uri={`https://wger.de${
                          index == 0 ? x.image_url_main : x.image_url_secondary
                        }`}
                        className="rounded-lg border-2"
                      ></SvgUri>
                    </View>
                  ));
                  return (
                    <View className="flex-1 justify-start items-center relative">
                      {base}
                      {child}
                    </View>
                  );
                }}
              ></FlatList> */}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default ExerciseDetails;
