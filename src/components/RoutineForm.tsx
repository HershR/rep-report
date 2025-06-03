import { View, FlatList, TouchableOpacity } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import SearchModal from "./SearchModal";
import { Link, router } from "expo-router";
import { CircleX } from "../lib/icons/CircleX";
import ExerciseImage from "./ExerciseImage";
import { toUpperCase } from "../services/textFormatter";

interface Props {
  defaultForm?: RoutineFormField;
  onSubmit: (data: RoutineFormField) => void;
}
export interface RoutineFormField {
  name: string;
  description: string;
  exercises: { id: number; name: string; category?: string; image?: string }[];
  days: Day[];
}

export interface Day {
  id: number;
  label: string;
  selected: boolean;
}

export const DayFields: Day[] = [
  { id: 0, label: "S", selected: false },
  { id: 1, label: "M", selected: false },
  { id: 2, label: "T", selected: false },
  { id: 3, label: "W", selected: false },
  { id: 4, label: "T", selected: false },
  { id: 5, label: "F", selected: false },
  { id: 6, label: "S", selected: false },
];

const RoutineForm = ({ defaultForm, onSubmit }: Props) => {
  const [searchModalVisble, setSearchModalVisible] = useState(false);
  const flatlistRef = useRef<FlatList>(null);
  const goToExercise = (id: number) => {
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
      days: DayFields,
    },
  });
  const {
    fields: exerciseFields,
    append: appendExercise,
    remove: removeExercise,
  } = useFieldArray({
    control,
    name: "exercises",
    rules: {
      required: "At Least One Exercise is Required",
    },
  });

  const {
    fields: dayFields,
    append,
    remove,
    replace,
  } = useFieldArray<RoutineFormField, "days">({
    control,
    name: "days",
  });

  return (
    <>
      <Card className="flex-1 w-full md:max-w-md">
        <CardHeader className="flex-row w-full justify-between items-center pb-4"></CardHeader>
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
        <CardContent className="gap-y-2">
          <View className="flex-row max-w-sm justify-between items-center gap-x-2">
            {[0, 1, 2, 3, 4, 5, 6].map((day_no) => {
              return (
                <Controller
                  key={day_no}
                  control={control}
                  name={`days.${day_no}`}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <Button
                        className="h-8 w-8 aspect-square rounded-full"
                        size={"icon"}
                        variant={value.selected ? "default" : "outline"}
                        onPress={() => {
                          const toggledDay = {
                            ...value,
                            selected: !value.selected,
                          };
                          onChange(toggledDay);
                        }}
                      >
                        <Text>{value.label}</Text>
                      </Button>
                    );
                  }}
                />
              );
            })}
          </View>
        </CardContent>
        <CardContent>
          <Separator />
        </CardContent>
        <CardContent className="flex-1 gap-y-4">
          <FlatList
            ref={flatlistRef}
            data={exerciseFields}
            keyExtractor={(item, index) => `${index}_${item.id}`}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-y-4"
            ListEmptyComponent={<Text>No Exercise Added</Text>}
            ListHeaderComponent={
              errors.exercises?.root && (
                <Text className="text-destructive">
                  *{errors.exercises.root.message}
                </Text>
              )
            }
            renderItem={({ index }) => {
              return (
                <Controller
                  control={control}
                  name={`exercises.${index}`}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <Card
                        className={`flex-1 max-h-22 md:max-h-32 justify-center items-center py-1 px-2`}
                      >
                        <View className="flex-row w-full h-full justify-center items-center">
                          <Link href={`/exercise/${value.id}`} asChild>
                            <TouchableOpacity>
                              <ExerciseImage
                                image_uri={value.image || null}
                                containerClassname="h-full aspect-square justify-center items-center"
                                contextFit="contain"
                              ></ExerciseImage>
                            </TouchableOpacity>
                          </Link>
                          <View className="flex-1 mx-4">
                            <Text
                              numberOfLines={1}
                              className="text-left text-lg font-semibold"
                            >
                              {toUpperCase(value.name)}
                            </Text>
                            {value.category && <Text>({value.category})</Text>}
                          </View>
                          <Button
                            variant={"ghost"}
                            size={"icon"}
                            className="flex"
                            onPress={() => {
                              removeExercise(index);
                            }}
                          >
                            <CircleX className="color-destructive" size={24} />
                          </Button>
                        </View>
                      </Card>
                    </>
                  )}
                />
              );
            }}
          />
        </CardContent>
        <CardContent>
          <Separator />
        </CardContent>
        <CardFooter className="flex-col gap-y-2 justify-center items-center">
          <Button
            className="w-full"
            onPress={() => setSearchModalVisible(true)}
          >
            <Text>Add Exercise</Text>
          </Button>
          <View className="flex-row gap-x-2">
            <Button
              className="flex-1"
              variant={"destructive"}
              onPress={() =>
                reset(
                  { name: "", description: "", exercises: [] },
                  { keepDefaultValues: false }
                )
              }
            >
              <Text>Clear</Text>
            </Button>
            <Button className="flex-1" onPress={handleSubmit(onSubmit)}>
              <Text>Save</Text>
            </Button>
          </View>
        </CardFooter>
      </Card>
      <SearchModal
        visible={searchModalVisble}
        onClose={() => setSearchModalVisible(false)}
        onSelectExercise={(exercise: Exercise) => {
          setSearchModalVisible(false);

          appendExercise({
            id: exercise.id,
            name: exercise.name,
            image: exercise.image || undefined,
            category: exercise.category || undefined,
          });
          setTimeout(() => {
            flatlistRef.current?.scrollToEnd({ animated: true });
          }, 500);
        }}
        onShowExercise={goToExercise}
      />
    </>
  );
};

export default RoutineForm;
