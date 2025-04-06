import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DatePickerWithWeek from "@/src/components/datepicker/DatePickerWithWeek";
import { DateTime } from "luxon";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import useFetch from "@/src/services/useFetch";
import { fetchExcercises } from "@/src/services/api";
import { ExerciseInfo } from "@/src/interfaces/interface";
import RecentExerciseCard from "@/src/components/RecentExerciseCard";
import SearchBar from "@/src/components/SearchBar";
import { useRouter } from "expo-router";
import exerciseInfo from "@/src/data/exerciseInfo";
import { useDate } from "@/src/context/DateContext";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/src//db/schema";

export default function Index() {
  const router = useRouter();

  const { selectedDate, setSelectedDate } = useDate();

  function updateDate(newDate: DateTime) {
    if (!!newDate) {
      setSelectedDate(newDate);
    }
  }

  // const {
  //   data: recentExercise,
  //   loading,
  //   error,
  // }: { data: ExerciseInfo[]; loading: boolean; error: any } = useFetch(() =>
  //   fetchExcercises({ offset: "", category: "", equipment: "" })
  // );
  const recentExercise = exerciseInfo;
  const loading = false;
  const error = undefined;

  return (
    <View className="flex-1 bg-secondary">
      <SafeAreaView className="flex-1 mx-8 my-10">
        <View className="flex">
          <DatePickerWithWeek
            currentDate={selectedDate!}
            onDateChange={updateDate}
          />
        </View>
        {loading ? (
          <ActivityIndicator
            size={"large"}
            className="mt-10 self-center"
          ></ActivityIndicator>
        ) : (
          <View className="flex-1">
            <View className="flex">
              <Text className="text-primary text-lg font-bold">
                Recent Exercise
              </Text>
              {recentExercise ? (
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-4 mt-3"
                  data={recentExercise.filter((x) => {
                    return (
                      x.translations.find((y) => !!y && y.language === 2) !==
                      undefined
                    );
                  })}
                  keyExtractor={(item) => item.uuid}
                  contentContainerStyle={{ gap: 26 }}
                  renderItem={({ item, index }) => (
                    <RecentExerciseCard {...item} />
                  )}
                  ItemSeparatorComponent={() => <View className="w-4" />}
                  initialNumToRender={5}
                ></FlatList>
              ) : null}
            </View>
            <View className="flex-1">
              <SearchBar
                placeholder={"Add exercise"}
                value={""}
                onPress={() => router.push("/search")}
              />
              <Text className="text-primary text-lg font-bold">
                Completed Exercise
              </Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
