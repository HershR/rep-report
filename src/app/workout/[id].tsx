import { View } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Workout,
  WorkoutSet,
  Workout as WorkoutType,
} from "@/src/interfaces/interface";
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
  deleteWorkoutSet,
  updateWorkoutWithSets,
} from "@/src/db/dbHelpers";
import { router, useLocalSearchParams } from "expo-router";
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
import { index } from "drizzle-orm/gel-core";

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
      setSelectedDate(DateTime.fromISO(originalWorkout.date));
    }
  }, [loading]);

  function addSet() {
    const emptySet: WorkoutSet = {
      id: -1,
      workout_id: 0,
      order: exerciseSets.length,
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
        if (i === index && prev[i].id >= 0) {
          //remove saved set
          setDeletedSets((p) => [...p, prev[i].id]);
        }

        return i !== index;
      })
    );
  }

  async function saveWorkout() {
    const workoutForm: Workout = {
      date: selectedDate?.toISODate()!,
      mode: selectedMode,
      exercise_id: parseInt(exerciseId),
      notes: workoutNotes,
      sets: exerciseSets,
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
                inputMode="numeric"
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
                inputMode="numeric"
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
                  setDeletedSets((prev) =>
                    exerciseSets.filter((x) => x.id >= 0).map((y) => y.id)
                  );
                  setExerciseSets([]);
                }}
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
