import { View, FlatList } from "react-native";
import React, { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import SearchModal from "./SearchModal";
import { router } from "expo-router";
import { CircleX } from "../lib/icons/CircleX";

interface Props {
  defaultForm?: RoutineFormField;
  onSubmit: (data: RoutineFormField) => void;
}
export interface RoutineFormField {
  name: string;
  description: string;
  exercises: { id: number; name: string }[];
}

const RoutineForm = ({ defaultForm, onSubmit }: Props) => {
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
  } = useForm<RoutineFormField>({
    defaultValues: defaultForm ?? {
      name: "",
      description: "",
      exercises: [],
    },
  });
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "exercises",
    rules: {
      required: "At Least One Exercise is Required",
    },
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
            rules={{ required: "Name can not be Empty" }}
            render={({ field: { onChange, value } }) => (
              <View className="justify-center items-center gap-x-2">
                <Input
                  className="flex-row w-full"
                  placeholder="Enter Name"
                  value={value}
                  onChangeText={onChange}
                ></Input>
                {errors.name && (
                  <View className="w-full items-start ml-4">
                    <Text className="text-destructive font-normal">
                      *{errors.name.message}
                    </Text>
                  </View>
                )}
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
                value={value}
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
            // contentContainerStyle={{ gap: 5 }}
            ItemSeparatorComponent={() => (
              <View className="h-2">
                <Separator />
              </View>
            )}
            ListHeaderComponent={
              errors.exercises?.root && (
                <Text className="text-destructive">
                  *{errors.exercises.root.message}
                </Text>
              )
            }
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
        <CardContent className="flex-row gap-x-2">
          <Button
            className="flex-1"
            variant={"destructive"}
            onPress={() => reset(undefined)}
          >
            <Text>Clear</Text>
          </Button>
          <Button className="flex-1" onPress={handleSubmit(onSubmit)}>
            <Text>Save</Text>
          </Button>
        </CardContent>
      </Card>
      <SearchModal
        visible={searchModalVisble}
        onClose={() => setSearchModalVisible(false)}
        onSelectExercise={(exercise: Exercise) => {
          setSearchModalVisible(false);
          append({ id: exercise.id, name: exercise.name });
        }}
        onShowExercise={goToExercise}
      />
    </>
  );
};

export default RoutineForm;
