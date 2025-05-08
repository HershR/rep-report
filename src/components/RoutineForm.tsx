import { View, FlatList, TouchableOpacity } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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
}

const RoutineForm = ({ defaultForm, onSubmit }: Props) => {
  const [searchModalVisble, setSearchModalVisible] = useState(false);
  const listRef = useRef<FlatList>(null);
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
    },
  });
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "exercises",
    rules: {
      required: "At Least One Exercise is Required",
    },
  });
  useEffect(() => {
    listRef.current?.scrollToEnd();
  }, [fields]);
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
        <CardContent className="flex-1 gap-y-4">
          <CardTitle className="font-semibold">Exercise</CardTitle>
          <FlatList
            ref={listRef}
            data={fields}
            keyExtractor={(item, index) => `${index}_${item.id}`}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-y-4"
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
                    <>
                      <Card
                        className={`flex-1 max-h-24 md:max-h-32 justify-center items-center py-1 px-2`}
                      >
                        <View className="flex-row w-full h-full justify-center items-center">
                          <Link href={`/exercise/${item.id}`} asChild>
                            <TouchableOpacity>
                              <ExerciseImage
                                image_uri={item.image || null}
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
                              {toUpperCase(item.name)}
                            </Text>
                            {item.category && <Text>({item.category})</Text>}
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
                      </Card>
                    </>
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
        </CardContent>
      </Card>
      <SearchModal
        visible={searchModalVisble}
        onClose={() => setSearchModalVisible(false)}
        onSelectExercise={(exercise: Exercise) => {
          setSearchModalVisible(false);

          append({
            id: exercise.id,
            name: exercise.name,
            image: exercise.image || undefined,
            category: exercise.category || undefined,
          });
        }}
        onShowExercise={goToExercise}
      />
    </>
  );
};

export default RoutineForm;
