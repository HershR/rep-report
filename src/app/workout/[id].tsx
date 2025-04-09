import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Workout, WorkoutSet } from "@/src/interfaces/interface";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useDate } from "@/src/context/DateContext";
import * as schema from "@/src/db/schema";
import { Text } from "@/src/components/ui/text";
import {
  addSetToWorkout,
  createWorkoutWithExercise,
  getWorkoutById,
  getRecentWorkout,
  updateWorkoutWithSets,
} from "@/src/db/dbHelpers";
import { router, useLocalSearchParams } from "expo-router";
import useFetch from "@/src/services/useFetch";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { DateTime } from "luxon";
import { ArrowRight } from "@/src/lib/icons/ArrowRight";

enum FormMode {
  Create = 0,
  Update = 1,
}

const WorkoutDetails = () => {
  const {
    id,
    exerciseId,
    exerciseName,
    exerciseURI,
  }: {
    id: string;
    exerciseId: string;
    exerciseName: string;
    exerciseURI: string;
  } = useLocalSearchParams(); //workout id if updating
  const mode: FormMode = parseInt(id) < 0 ? FormMode.Create : FormMode.Update;
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const scrollViewRef = useRef<ScrollView>(null);
  const { selectedDate, setSelectedDate } = useDate();
  const [localDate, setLocalDate] = useState(selectedDate);
  const [selectedMode, setSelectedMode] = useState<FormMode>(0);
  const [workoutSets, setExerciseSets] = useState<WorkoutSet[]>([]);
  const [workoutNotes, setWorkoutNotes] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const {
    data: originalWorkout,
    loading,
    error,
  } = useFetch(() =>
    mode === FormMode.Update
      ? getWorkoutById(drizzleDb, parseInt(id))
      : getRecentWorkout(drizzleDb, parseInt(exerciseId))
  );

  useEffect(() => {
    if (
      loading === false &&
      error === null &&
      !!originalWorkout &&
      !!originalWorkout.sets
    ) {
      setExerciseSets(originalWorkout.sets);
      setWorkoutNotes(originalWorkout.notes);
      setLocalDate(DateTime.fromISO(originalWorkout.date));
    }
  }, [loading]);

  function addSet() {
    const emptySet: WorkoutSet = {
      id: -1,
      workout_id: 0,
      order: workoutSets.length,
      reps: null,
      weight: null,
      duration: null,
    };
    setExerciseSets((prev) => [...prev, emptySet]);
  }

  function updateDuration(index: number, newDuration: string) {
    let formattedText = newDuration.replace(/[^0-9]/g, "");

    if (formattedText.length > 6) {
      formattedText = formattedText.slice(0, 6);
    }

    if (formattedText.length >= 3) {
      formattedText = formattedText.slice(0, 2) + ":" + formattedText.slice(2);
    }

    if (formattedText.length >= 6) {
      formattedText = formattedText.slice(0, 5) + ":" + formattedText.slice(5);
    }
    setExerciseSets((prev) =>
      prev.map((x, i) => {
        if (index === i) {
          return { ...x, duration: formattedText };
        }
        return x;
      })
    );
  }
  function updateWeight(index: number, newWeight: number) {
    setExerciseSets((prev) =>
      prev.map((x, i) => {
        if (index === i) {
          return {
            ...x,
            weight: !!newWeight && !isNaN(newWeight) ? newWeight : 0,
          };
        }
        return x;
      })
    );
  }
  function updateRep(index: number, newRep: number) {
    setExerciseSets((prev) =>
      prev.map((x, i) => {
        if (index === i) {
          return {
            ...x,
            reps: !!newRep && !isNaN(newRep) ? newRep : 1,
          };
        }
        return x;
      })
    );
  }
  function deleteSet(index: number) {
    setExerciseSets((prev) =>
      prev.filter((x, i) => {
        return i !== index;
      })
    );
  }

  async function saveWorkout() {
    const workoutForm: Workout = {
      date: localDate?.toISODate()!,
      mode: selectedMode,
      exercise_id: parseInt(exerciseId),
      notes: workoutNotes,
      sets: workoutSets,
      id: 0,
      collection_id: null,
    };
    if (mode === FormMode.Create) {
      const workoutID = await createWorkoutWithExercise(drizzleDb, workoutForm);
      for (let index = 0; index < workoutForm.sets.length; index++) {
        let element = workoutForm.sets[index];
        if (workoutForm.mode === 0) {
          element = {
            ...element,
            order: index,
            duration: null,
            weight: element.weight || 0,
            reps: element.reps || 1,
          };
        } else {
          element = {
            ...element,
            order: index,
            weight: null,
            reps: null,
            duration: element.duration || "00:00:00",
          };
        }
        await addSetToWorkout(drizzleDb, {
          ...element,
          workout_id: workoutID,
          order: element.order,
        });
        router.push("/");
      }
    } else {
      await updateWorkoutWithSets(drizzleDb, originalWorkout!.id, workoutForm);
    }
  }
  function setField() {
    return workoutSets.map((item, index) => {
      return (
        <CardContent
          key={index}
          className="flex-row w-full gap-x-4 justify-center items-center"
        >
          <View className="w-8 h-8 justify-center items-center bg-primary rounded-full">
            <Text className="text-center text-secondary">{index + 1}</Text>
          </View>
          {selectedMode === 0 ? (
            <>
              <Input
                inputMode="numeric"
                autoComplete="off"
                autoCapitalize="none"
                onChangeText={(text) => {
                  updateRep(index, parseFloat(text));
                }}
                placeholder="reps"
                value={item.reps?.toString() || undefined}
                className="flex-1"
              ></Input>
              <Input
                inputMode="numeric"
                autoComplete="off"
                autoCapitalize="none"
                onChangeText={(text) => {
                  updateWeight(index, parseFloat(text));
                }}
                placeholder="weight"
                value={item.weight?.toString() || undefined}
                className="flex-1"
              ></Input>
            </>
          ) : (
            <>
              <Input
                keyboardType="numeric"
                autoComplete="off"
                autoCapitalize="none"
                onChangeText={(text) => {
                  updateDuration(index, text);
                }}
                placeholder="HH:MM:SS"
                maxLength={8}
                value={item.duration || undefined}
                className="flex-1"
              ></Input>
            </>
          )}
          <Button
            variant={"ghost"}
            size={"icon"}
            className="flex"
            onPress={() => deleteSet(index)}
          >
            <Feather name="x-circle" size={24} />
          </Button>
        </CardContent>
      );
    });
  }
  return (
    <View className="flex-1 bg-secondary">
      <Image
        source={{ uri: exerciseURI }}
        className="w-full h-64 bg-secondary"
        resizeMode="cover"
      ></Image>
      <SafeAreaView className="flex-1">
        <Button
          variant={"ghost"}
          size={"icon"}
          onPress={router.back}
          className="absolute mx-8"
        >
          <ArrowRight size={32} className="rotate-180 color-primary mb-4" />
        </Button>
        <KeyboardAvoidingView
          className="relative flex-1 mx-8 my-10 justify-start items-center"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* <Text className="text-4xl font-bold mb-2">
            {mode === FormMode.Create ? "New Workout" : "Update Workout"}
          </Text> */}
          <Card className="flex-1 w-full">
            <View testID="header">
              <CardHeader>
                <CardTitle>{exerciseName}</CardTitle>
                <View className="flex-row items-center gap-x-2">
                  <Text className="text-2xl">
                    {localDate?.toFormat("LLL dd, yyyy")}
                  </Text>
                  <Button variant={"ghost"} size={"icon"}>
                    <AntDesign
                      name="calendar"
                      size={30}
                      onPress={() => setDatePickerVisibility(true)}
                    />
                  </Button>
                </View>
              </CardHeader>
              <CardContent className="">
                <Textarea
                  placeholder="Enter Notes"
                  value={!!workoutNotes ? workoutNotes : undefined}
                  onChangeText={(text) => setWorkoutNotes(text)}
                ></Textarea>
              </CardContent>
              <CardContent>
                <Text>Sets</Text>
              </CardContent>
              <CardContent className="flex-row gap-x-4 justify-center items-center">
                <Text className="flex text-center text-lg w-8">#</Text>
                <Text className="flex-1 text-center text-lg">Reps</Text>
                <Text className="flex-1 text-center text-lg">Weight (lb)</Text>
                <View className="flex w-10 text-center text-lg"></View>
              </CardContent>
            </View>

            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              className="flex flex-grow mb-2"
            >
              {setField()}
            </ScrollView>

            <CardFooter className="flex flex-col gap-y-2">
              <Button
                className="w-full"
                onPress={() => {
                  addSet();
                  scrollViewRef.current?.scrollToEnd();
                }}
                disabled={workoutSets.length > 19}
              >
                <Text>Add Set</Text>
              </Button>
              <View className="flex-row w-full justify-center items-center gap-x-2">
                <Button
                  className="flex-1"
                  onPress={async () => await saveWorkout()}
                >
                  <Text>Save</Text>
                </Button>
                <Button
                  className="flex-1"
                  variant={"destructive"}
                  onPress={() => {
                    setExerciseSets([]);
                  }}
                >
                  <Text>Clear Sets</Text>
                </Button>
              </View>
            </CardFooter>
          </Card>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={localDate?.toJSDate()}
        onConfirm={(date) => {
          setLocalDate(DateTime.fromJSDate(date));
          setDatePickerVisibility(false);
        }}
        onCancel={() => setDatePickerVisibility(false)}
      />
    </View>
  );
};

export default WorkoutDetails;
