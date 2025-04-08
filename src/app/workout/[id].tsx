import { View } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { WorkoutSet, Workout as WorkoutType } from "@/src/interfaces/interface";
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
} from "@/src/db/dbHelpers";
import { useLocalSearchParams } from "expo-router";
import useFetch from "@/src/services/useFetch";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Feather } from "@expo/vector-icons";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { DateTime } from "luxon";

enum FormMode {
  Create = 0,
  Update = 1,
}

const WorkoutDetails = () => {
  const {
    id,
    exerciseId,
    exerciseName,
  }: { id: string; exerciseId: string; exerciseName: string } =
    useLocalSearchParams(); //workout id if updating
  const mode: FormMode = parseInt(id) < 0 ? FormMode.Create : FormMode.Update;
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const { selectedDate, setSelectedDate } = useDate();
  const [selectedMode, setSelectedMode] = useState<0 | 1>(0);
  const [exerciseSets, setExerciseSets] = useState<WorkoutSet[]>([]);
  const [workoutNotes, setWorkoutNotes] = useState<string | null>(null);
  const [deletedSets, setDeletedSets] = useState<number[]>([]);
  const {
    data: prevWorkout,
    loading,
    error,
  } = useFetch(() =>
    mode === FormMode.Update
      ? getWorkoutById(drizzleDb, parseInt(id))
      : getRecentWorkout(drizzleDb, parseInt(exerciseId))
  );
  useEffect(() => {
    console.log("loading: ", loading);
    if (
      loading === false &&
      error === null &&
      !!prevWorkout &&
      !!prevWorkout.sets
    ) {
      console.log("Sets: ", prevWorkout.sets);
      setExerciseSets(prevWorkout.sets);
      setWorkoutNotes(prevWorkout.notes);
      setSelectedDate(DateTime.fromISO(prevWorkout.date));
    }
  }, [loading]);

  function addSet() {
    const emptySet: WorkoutSet = {
      id: 0,
      workout_id: 0,
      order: exerciseSets.length,
      reps: null,
      weight: null,
      duration: null,
      notes: null,
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
        if (i === index && prev[i].id >= 0) {
          //remove saved set
          setDeletedSets((p) => [...p, prev[i].id]);
        }

        return i !== index;
      })
    );
  }
  function save() {
    // const workoutForm: WorkoutType = {
    //   id: 0,
    //   date: date,
    //   mode: selectedMode,
    //   exercise_id:
    //     typeof exerciseId === "number" ? exerciseId : parseInt(exerciseId),
    //   sets: exerciseSets,
    // };
    //onSubmit(workoutForm);
  }
  async function saveWorkout(workoutForm: WorkoutType) {
    console.log("Save Workout ", workoutForm);
    const workoutID = await createWorkoutWithExercise(drizzleDb, {
      ...workoutForm,
    });
    for (let index = 0; index < workoutForm.sets.length; index++) {
      let element = workoutForm.sets[index];
      if (workoutForm.mode === 0) {
        element = {
          ...element,
          duration: null,
          weight: element.weight || 0,
          reps: element.reps || 1,
        };
      } else {
        element = {
          ...element,
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
    }
  }
  function setField() {
    return exerciseSets.map((x, index) => {
      return (
        <CardContent
          key={index}
          className="flex-row w-full gap-x-4 justify-center items-center"
        >
          <Text className="flex w-8 h-8 text-center bg-secondary rounded-md">
            {index + 1}
          </Text>
          {selectedMode === 0 ? (
            <>
              <Input
                keyboardType="numeric"
                autoComplete="off"
                autoCapitalize="none"
                onChangeText={(text) => {
                  updateRep(index, parseFloat(text));
                }}
                placeholder="reps"
                value={x.reps?.toString() || undefined}
                className="flex-1"
              ></Input>
              <Input
                keyboardType="numeric"
                autoComplete="off"
                autoCapitalize="none"
                onChangeText={(text) => {
                  updateWeight(index, parseFloat(text));
                }}
                placeholder="weight"
                value={x.weight?.toString() || undefined}
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
                value={x.duration || undefined}
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
      <SafeAreaView className="flex-1 mx-8 my-10 justify-start">
        <Text className="text-4xl font-bold">
          {mode === FormMode.Create ? "New Workout" : "Update Workout"}
        </Text>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{exerciseName}</CardTitle>
          </CardHeader>
          <CardContent className="flex-row">
            <Text>{selectedDate?.toISODate()}</Text>
          </CardContent>
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
          {setField()}
          {/* <CardContent className="flex-row w-full gap-x-4 justify-center items-center">
            <Text className="flex w-8 h-8 text-center bg-secondary rounded-md">
              1
            </Text>
            <Input
              keyboardType="numeric"
              autoComplete="off"
              className="flex-1"
            ></Input>
            <Input
              keyboardType="numeric"
              autoComplete="off"
              className="flex-1"
            ></Input>
            <Button variant={"ghost"} size={"icon"} className="flex">
              <Feather name="x-circle" size={24} />
            </Button>
          </CardContent> */}
          <CardFooter className="flex flex-col gap-y-2">
            <Button className="w-full" onPress={addSet}>
              <Text>Add Set</Text>
            </Button>
            <View className="flex-row w-full justify-center items-center gap-x-2">
              <Button className="flex-1">
                <Text>Save</Text>
              </Button>
              <Button
                className="flex-1"
                variant={"destructive"}
                onPress={() => setExerciseSets([])}
              >
                <Text>Clear</Text>
              </Button>
            </View>
          </CardFooter>
        </Card>
      </SafeAreaView>
    </View>
  );
};

export default WorkoutDetails;
