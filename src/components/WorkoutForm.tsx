import {
  View,
  Text,
  useWindowDimensions,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { ExerciseInfo, Workout, WorkoutSet } from "@/src/interfaces/interface";
import { removeHTML, toUpperCase } from "@/src/services/textFormatter";
import { SearchChip } from "./SearchChip";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { createWorkoutWithExercise } from "../db/dbHelpers";

interface Props {
  date: string;
  exerciseId: number | string;
  exerciseName: string;
  exerciseCategory: string;
  exerciseImage?: string;
  prevData?: WorkoutSet[] | undefined;
  mode: "weight" | "time";
  onSubmit: (form: Workout) => void;
}
const WorkoutForm = ({
  date,
  exerciseId,
  prevData: defaultData,
  mode = "weight",
  onSubmit,
}: Props) => {
  const [exerciseSets, setExerciseSets] = useState<WorkoutSet[]>(
    defaultData || []
  );
  const [selectedMode, setSelectedMode] = useState(mode);
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
    const workoutForm: Workout = {
      id: 0,
      date: date,
      mode: selectedMode === "time" ? 1 : 0,
      exercise_id:
        typeof exerciseId === "number" ? exerciseId : parseInt(exerciseId),
      sets: exerciseSets,
    };
    onSubmit(workoutForm);
  }
  function setField() {
    if (selectedMode === "time") {
      return exerciseSets.map((x, index) => {
        return (
          <View
            key={index}
            className="flex-1 flex-row justify-evenly items-center px-5 gap-x-10"
          >
            <TouchableOpacity
              className="absolute -left-4"
              onPress={() => deleteSet(index)}
            >
              <Feather name="x-circle" size={24} color="#2A2E3C" />
            </TouchableOpacity>
            <TextInput
              keyboardType="numeric"
              autoComplete="off"
              autoCapitalize="none"
              onChangeText={(text) => {
                updateDuration(index, text);
              }}
              placeholder="HH:MM:SS"
              maxLength={8}
              value={x.duration || undefined}
              className="flex-1 bg-gray-300 rounded-lg"
            ></TextInput>
          </View>
        );
      });
    }
    return exerciseSets.map((x, index) => {
      return (
        <View
          key={index}
          className="flex-1 flex-row justify-evenly items-center px-5 gap-x-10"
        >
          <TouchableOpacity
            className="absolute -left-4"
            onPress={() => deleteSet(index)}
          >
            <Feather name="x-circle" size={24} color="#2A2E3C" />
          </TouchableOpacity>
          <TextInput
            keyboardType="numeric"
            autoComplete="off"
            autoCapitalize="none"
            onChangeText={(text) => {
              updateWeight(index, parseFloat(text));
            }}
            placeholder="enter weight"
            value={x.weight?.toString() || undefined}
            className="flex-1 bg-gray-300 rounded-lg"
          ></TextInput>
          <TextInput
            keyboardType="numeric"
            autoComplete="off"
            autoCapitalize="none"
            onChangeText={(text) => {
              updateRep(index, parseFloat(text));
            }}
            placeholder="enter reps"
            value={x.reps?.toString() || undefined}
            className="flex-1 bg-gray-300 rounded-lg"
          ></TextInput>
        </View>
      );
    });
  }
  return (
    <View className="flex gap-y-4 mt-4">
      <Text className="flex-1 text-primary text-xl font-bold">
        Record Workout
      </Text>
      <View className="flex-1 bg-gray-300 mx-5 rounded-lg">
        <Picker
          selectedValue={selectedMode}
          onValueChange={(itemValue) => {
            setSelectedMode(itemValue);
          }}
        >
          <Picker.Item label="Weight" value="weight" />
          <Picker.Item label="Time" value="time" />
        </Picker>
      </View>
      {selectedMode === "weight" ? (
        <View className="flex-row justify-evenly items-center">
          <Text className="flex-1 text-primary text-xl font-black text-center uppercase">
            Weight (lb)
          </Text>
          <Text className="flex-1 text-primary text-xl font-black text-center uppercase">
            Reps
          </Text>
        </View>
      ) : (
        <View>
          <Text className="flex-1 text-primary text-xl font-black text-center uppercase">
            Time (HH:mm:ss)
          </Text>
        </View>
      )}
      {setField()}
      <View className="justify-center items-center mx-5">
        <TouchableOpacity
          onPress={addSet}
          className="w-full items-center justify-center bg-accent rounded-lg py-3.5"
        >
          <Text className="text-secondary text-xl font-semibold text-center">
            Add Set +
          </Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row justify-center items-center mx-5 gap-x-4">
        <TouchableOpacity
          className="flex-1 bg-green-500 justify-center items-center rounded-lg py-3.5"
          onPress={save}
        >
          <Text className="text-secondary text-xl font-semibold text-center">
            Save
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setExerciseSets([])}
          className="flex-1  bg-red-500 justify-center items-center rounded-lg py-3.5"
        >
          <Text className="text-secondary text-xl font-semibold text-center">
            Clear
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WorkoutForm;
