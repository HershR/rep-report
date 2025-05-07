import { View, FlatList } from "react-native";
import React, { useState } from "react";
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  useFieldArray,
  useForm,
  UseFormStateReturn,
} from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import SearchModal from "./SearchModal";
import { router } from "expo-router";
import { CircleX } from "../lib/icons/CircleX";
const RoutineForm = () => {
  const [searchModalVisble, setSearchModalVisible] = useState(false);
  const goToExercise = (id: number) => {
    console.log("Navigating to exercise with ID:", id);
    setSearchModalVisible(false);
    setTimeout(() => {
      router.push(`/exercise/${id}`);
    }, 300);
  };
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<WorkoutRoutine>({
    defaultValues: {
      id: 0,
      name: "",
      description: "",
      exercises: [],
    },
  });
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "exercises",
    rules: { required: true, minLength: 1 },
  });
  return (
    <>
      <Card className="flex-1 w-full md:max-w-md">
        <CardHeader className="flex-row w-full justify-between items-center">
          <CardTitle>Routine</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row justify-center items-center gap-x-2">
                <Input
                  className="flex-1"
                  placeholder="Enter name"
                  onChangeText={onChange}
                ></Input>
              </View>
            )}
          />
        </CardContent>
        <CardContent>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Textarea
                placeholder="Enter Description"
                value={value ?? ""}
                onChangeText={onChange}
              ></Textarea>
            )}
          />
        </CardContent>
        <CardContent>
          <Separator />
        </CardContent>
        <CardContent className="flex-1">
          <CardTitle className="font-semibold mb-2">Exercise</CardTitle>
          <FlatList
            data={fields}
            keyExtractor={(item, index) => `${index}_${item.id}`}
            contentContainerStyle={{ gap: 5 }}
            renderItem={({ item, index }) => {
              return (
                <Controller
                  control={control}
                  name={`exercises.${index}`}
                  render={({ field: { onChange, value } }) => (
                    <View className="flex-row justify-between">
                      <View className="flex-row gap-x-4 items-center">
                        <View className="w-8 h-8 justify-center items-center bg-primary rounded-full">
                          <Text className="text-center text-secondary">
                            {index + 1}
                          </Text>
                        </View>
                        <Text className="text-lg font-medium">{item.name}</Text>
                      </View>
                      <Button
                        variant={"ghost"}
                        size={"icon"}
                        className="flex"
                        onPress={() => {
                          remove(index);
                        }}
                      >
                        <CircleX className="color-destructive" size={24} />
                      </Button>
                    </View>
                  )}
                />
              );
            }}
          />
          <Button onPress={() => setSearchModalVisible(true)}>
            <Text>Add Exercise</Text>
          </Button>
        </CardContent>
        <CardContent>
          <Separator />
        </CardContent>
        <CardContent className="gap-y-2">
          <Button>
            <Text>Save</Text>
          </Button>
        </CardContent>
      </Card>
      <SearchModal
        visible={searchModalVisble}
        onClose={() => setSearchModalVisible(false)}
        onSelectExercise={(exercise: Exercise) => {
          setSearchModalVisible(false);
          append(exercise);
        }}
        onShowExercise={goToExercise}
      />
    </>
  );
};

export default RoutineForm;
