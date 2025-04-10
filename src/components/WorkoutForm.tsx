import { ScrollView, View } from "react-native";
import React, { useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Exercise, Workout, WorkoutSet } from "../interfaces/interface";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Text } from "./ui/text";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { AntDesign, Feather } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Textarea } from "./ui/textarea";
import { DateTime } from "luxon";
import { useDate } from "../context/DateContext";

interface Props {
  defaultForm?: Workout;
  exercise: Partial<Exercise>;
  onSubmit: (data: Workout) => void;
}

const WorkoutForm = ({ defaultForm, exercise, onSubmit }: Props) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const { control, handleSubmit, watch, setValue } = useForm<Workout>({
    defaultValues: {
      ...defaultForm,
      mode: defaultForm?.mode || 0,
      date: defaultForm?.date || new Date().toISOString().slice(0, 10),
    },
  });
  const date = watch("date");
  const mode = watch("mode");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sets",
  });
  const addSet = () => {
    const emptySet: WorkoutSet = {
      id: -1,
      workout_id: 0,
      order: fields.length,
      reps: null,
      weight: null,
      duration: null,
    };
    append(emptySet);
  };
  return (
    <Card className="flex-1 w-full">
      <CardHeader>
        <CardTitle>{exercise.name}</CardTitle>
      </CardHeader>
      {/* DATE */}
      <CardContent>
        <Text className="font-semibold">Date</Text>
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <View className="flex-row items-center gap-x-2">
              <Text className="font-medium text-xl">{date}</Text>
              <Button variant={"ghost"} size={"icon"}>
                <AntDesign
                  name="calendar"
                  size={30}
                  onPress={() => {
                    setDatePickerVisibility(true);
                  }}
                />
              </Button>
            </View>
          )}
        />
      </CardContent>

      {/* NOTES */}
      <CardContent>
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value } }) => (
            <Textarea
              placeholder="Enter Notes"
              value={value ?? ""}
              onChangeText={onChange}
            ></Textarea>
          )}
        />
      </CardContent>
      {/* MODE */}
      <CardContent>
        <View className="flex-row">
          <Button
            className={`flex-1 py-2 rounded-lg rounded-r-none items-center ${
              mode === 0 ? "bg-primary" : "bg-border"
            }`}
            onPress={() => setValue("mode", 0)}
          >
            <Text
              className={`"${mode === 0 ? "text-secondary" : ""} font-medium"`}
            >
              Weight
            </Text>
          </Button>
          <Button
            className={`flex-1 py-2 rounded-lg rounded-l-none items-center ${
              mode === 1 ? "bg-primary" : "bg-border"
            }`}
            onPress={() => setValue("mode", 1)}
          >
            <Text
              className={`"${mode === 1 ? "text-secondary" : ""} font-medium"`}
            >
              Time
            </Text>
          </Button>
        </View>
      </CardContent>
      {/* SETS */}
      <CardContent>
        <Text className="font-semibold mb-2">Sets</Text>
        <View className="flex-row gap-x-4 justify-center items-center">
          <Text className="flex text-center text-lg w-8">#</Text>
          {mode === 0 ? (
            <>
              <Text className="flex-1 text-center text-lg">Reps</Text>
              <Text className="flex-1 text-center text-lg">Weight (lb)</Text>
            </>
          ) : (
            <Text className="flex-1 text-center text-lg">Time</Text>
          )}
          <View className="flex w-10 text-center text-lg"></View>
        </View>
      </CardContent>
      <ScrollView
        ref={scrollViewRef}
        className="flex flex-grow mb-2"
        showsVerticalScrollIndicator={false}
      >
        {fields.map((field, index) => (
          <CardContent
            key={index}
            className="flex-row w-full gap-x-4 justify-center items-center"
          >
            <View className="w-8 h-8 justify-center items-center bg-primary rounded-full">
              <Text className="text-center text-secondary">{index + 1}</Text>
            </View>
            {mode === 0 ? (
              <>
                <Controller
                  control={control}
                  name={`sets.${index}.reps`}
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      className="flex-1"
                      autoComplete="off"
                      autoCapitalize="none"
                      keyboardType="numeric"
                      placeholder="Reps"
                      value={value?.toString() ?? ""}
                      onChangeText={(text) => {
                        const num = parseInt(text);
                        if (!!num && !isNaN(num)) {
                          onChange(num);
                          return;
                        }
                        onChange(null);
                      }}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name={`sets.${index}.weight`}
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      className="flex-1"
                      autoComplete="off"
                      autoCapitalize="none"
                      keyboardType="numeric"
                      placeholder="Weight"
                      value={value?.toString() ?? ""}
                      onChangeText={(text) => {
                        const num = parseFloat(text);
                        if (!!num && !isNaN(num)) {
                          onChange(num);
                          return;
                        }
                        onChange(null);
                      }}
                    />
                  )}
                />
              </>
            ) : (
              <Controller
                control={control}
                name={`sets.${index}.duration`}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-center"
                    placeholder="Duration (e.g. 00:02:30)"
                    value={value ?? ""}
                    onChangeText={onChange}
                  />
                )}
              />
            )}
            <Button
              variant={"ghost"}
              size={"icon"}
              className="flex"
              onPress={() => remove(index)}
            >
              <Feather name="x-circle" size={24} />
            </Button>
          </CardContent>
        ))}
      </ScrollView>

      {/* ADD SET */}
      <CardFooter className="flex flex-col gap-y-2">
        <Button
          className="w-full"
          onPress={() => {
            addSet();
            scrollViewRef.current?.scrollToEnd();
          }}
          disabled={fields.length >= 15}
        >
          <Text>Add Set</Text>
        </Button>
        <View className="flex-row w-full justify-center items-center gap-x-2">
          <Button className="flex-1" onPress={handleSubmit(onSubmit)}>
            <Text>Save</Text>
          </Button>
          <Button
            className="flex-1"
            variant={"destructive"}
            onPress={() => {
              remove();
            }}
          >
            <Text>Clear Sets</Text>
          </Button>
        </View>
      </CardFooter>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={DateTime.fromISO(date).toJSDate()}
        onConfirm={(date) => {
          setValue("date", DateTime.fromJSDate(date).toISODate()!);
          setDatePickerVisibility(false);
        }}
        onCancel={() => setDatePickerVisibility(false)}
      />
    </Card>
  );
};

export default WorkoutForm;
