import { View, Text, useWindowDimensions } from "react-native";
import React, { useState } from "react";
import { ExerciseInfo } from "@/src/interfaces/interface";
import { removeHTML, toUpperCase } from "@/src/services/textFormatter";
import { SearchChip } from "./SearchChip";

interface Props {
  date: string;
  exerciseId: number | string;
  exerciseName: string;
  exerciseCategory: string;
  exerciseImage?: string;
  defaultData?: SetInfo[] | undefined;
}

interface SetInfo {
  index: number;
  reps?: number;
  weight?: number;
  unit?: string;
  durration?: string;
}

const WorkoutForm = ({
  date,
  exerciseId,
  exerciseName,
  exerciseCategory,
  exerciseImage,
  defaultData,
}: Props) => {
  const [exerciseSets, setExerciseSets] = useState<SetInfo[]>(
    defaultData || []
  );

  function addSet() {
    setExerciseSets((prev) => [
      ...prev,
      {
        ...prev[prev.length - 1],
        index: prev.length,
      },
    ]);
  }

  function updateUnit(newUnit: "lb" | "kg") {
    setExerciseSets((prev) =>
      prev.map((x) => {
        return { ...x, unit: newUnit };
      })
    );
  }

  function updateWeight(index: number, newWeight: number) {
    setExerciseSets((prev) =>
      prev.map((x, i) => {
        if (index === i) {
          return { ...x, weight: newWeight };
        }
        return x;
      })
    );
  }
  function updateDurration(index: number, newDurration: string) {
    setExerciseSets((prev) =>
      prev.map((x, i) => {
        if (index === i) {
          return { ...x, durration: newDurration };
        }
        return x;
      })
    );
  }

  function save() {
    const form = {
      date,
      exerciseId,
      exerciseName,
      exerciseCategory,
      exerciseImage,
      exerciseSets,
    };
  }
  return <View></View>;
};

export default WorkoutForm;
