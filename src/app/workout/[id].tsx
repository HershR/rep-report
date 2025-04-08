import { View, Text } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { WorkoutSet, Workout as WorkoutType } from "@/src/interfaces/interface";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useDate } from "@/src/context/DateContext";
import * as schema from "@/src/db/schema";
import { addSetToWorkout, createWorkoutWithExercise } from "@/src/db/dbHelpers";

const WorkoutDetails = () => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const { selectedDate, setSelectedDate } = useDate();
  const [exerciseSets, setExerciseSets] = useState<WorkoutSet[]>([]);
  const [selectedMode, setSelectedMode] = useState<0 | 1>(0);
  function addSet() {
    setExerciseSets((prev) => [
      ...prev,
      {
        id: 0,
        workout_id: 0,
        order: prev.length,
      },
    ]);
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
      prev
        .filter((x) => x.order !== index)
        .map((y, i) => {
          return { ...y, index: i };
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
          duration: undefined,
          weight: element.weight || 0,
          reps: element.reps || 1,
        };
      } else {
        element = {
          ...element,
          weight: undefined,
          reps: undefined,
          duration: element.duration || "00:00:00",
        };
      }
      await addSetToWorkout(drizzleDb, {
        ...element,
        workout_id: workoutID,
        order: index,
      });
    }
  }
  return (
    <View className="flex-1 bg-secondary">
      <SafeAreaView className="flex-1 mx-8 my-10"></SafeAreaView>
    </View>
  );
};

export default WorkoutDetails;
