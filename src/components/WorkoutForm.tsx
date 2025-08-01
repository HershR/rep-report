import { ScrollView, View } from "react-native";
import React, { ReactNode, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
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
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Textarea } from "./ui/textarea";
import { DateTime } from "luxon";
import { CircleX } from "~/lib/icons/CircleX";
import WorkoutTimeSelector from "./WorkoutTimeSelector";
import { CalendarDays } from "../lib/icons/CalendarDays";
import { useMeasurementUnit } from "../context/MeasurementUnitContext";
import { UNIT_LABELS } from "@/src/constants/measurementLables";
import { convertWeight } from "../utils/measurementConversion";
import { Separator } from "./ui/separator";

interface WorkoutWithExercise
  extends Pick<Workout, "date" | "mode" | "notes" | "sets"> {
  exercise: Pick<Exercise, "name" | "image">;
}

interface Props {
  defaultForm: WorkoutWithExercise;
  onSubmit: (data: Workout) => void;
  action?: () => ReactNode;
}

const emptySet: WorkoutSet = {
  id: -1,
  workout_id: 0,
  order: 0,
  reps: null,
  weight: null,
  duration: null,
};
const WorkoutForm = ({ defaultForm, onSubmit, action }: Props) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const { unit } = useMeasurementUnit();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<Workout>({
    defaultValues: {
      ...defaultForm,
      mode: defaultForm?.mode || 0,
      date: defaultForm?.date || new Date().toISOString().slice(0, 10),
      sets: defaultForm.sets.length > 0 ? defaultForm.sets : [emptySet],
    },
  });
  const date = watch("date");
  const mode = watch("mode");

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "sets",
    rules: { required: true, minLength: 1 },
  });

  function addSet() {
    append({ ...emptySet, order: fields.length });
  }

  function formatTime(duration: string) {
    const n = duration.length;
    const format = "00:00:00";
    const pad = format.slice(0, 8 - n);
    duration = pad + duration;

    return duration;
  }

  const validateAndSubmit = (data: Workout) => {
    for (let i = 0; i < data.sets.length; i++) {
      const set = data.sets[i];
      if (data.mode === 0) {
        set.duration = null;
        set.weight = convertWeight(set.weight || 0, unit, "imperial");
      } else {
        set.reps = null;
        set.weight = null;
        set.duration = formatTime(set.duration!);
      }
    }

    onSubmit(data);
  };

  return (
    <Card className="relative flex-1 w-full md:max-w-[640px]">
      <CardHeader className="flex-row w-full justify-between items-center">
        <CardTitle className="mr-6">{defaultForm.exercise.name}</CardTitle>
      </CardHeader>
      <View className="absolute right-2 top-2">{action && action()}</View>
      {/* DATE */}
      <CardContent>
        <Controller
          control={control}
          name="date"
          render={({}) => (
            <View className="flex-row items-center gap-x-2">
              <Text className="font-medium text-xl">{date}</Text>
              <Button
                variant={"ghost"}
                size={"icon"}
                onPress={() => setDatePickerVisibility(true)}
              >
                <CalendarDays className="color-primary" size={25} />
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
      <CardContent>
        <Separator />
      </CardContent>
      {/* MODE */}
      <CardContent>
        <View className="flex-row">
          <Button
            className={`flex-1 py-2 rounded-md rounded-r-none items-center ${
              mode === 0 ? "bg-primary" : "bg-secondary"
            }`}
            onPress={() => {
              if (mode !== 0) {
                clearErrors();
              }
              setValue("mode", 0);
            }}
          >
            <Text className={`${mode === 0 ? "" : "text-primary"} font-medium`}>
              Weight
            </Text>
          </Button>
          <Button
            className={`flex-1 py-2 rounded-md rounded-l-none items-center ${
              mode === 1 ? "bg-primary" : "bg-secondary"
            }`}
            onPress={() => {
              if (mode !== 1) {
                clearErrors();
              }
              setValue("mode", 1);
            }}
          >
            <Text className={`${mode === 1 ? "" : "text-primary"} font-medium`}>
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
              <Text className="flex-1 text-center text-lg">
                Weight (
                {unit === "imperial"
                  ? UNIT_LABELS.imperial.weight
                  : UNIT_LABELS.metric.weight}
                )
              </Text>
            </>
          ) : (
            <View className="flex-1">
              <View className="w-full flex-row justify-evenly items-center gap-x-4">
                <Text className="flex-1 text-lg text-center">Hrs</Text>
                <Text className="flex-1 text-lg text-center">Mins</Text>
                <Text className="flex-1 text-lg text-center">Sec</Text>
              </View>
            </View>
          )}
          <View className="flex w-10 text-lg"></View>
        </View>
      </CardContent>
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 mb-2"
        showsVerticalScrollIndicator={false}
      >
        {fields.map((field, index) => (
          <CardContent
            key={field.id}
            className="flex w-full justify-center pb-0 mb-2"
          >
            <View className="flex-1 flex-row w-full items-center gap-x-4">
              <View className="w-8 h-8 justify-center items-center bg-primary rounded-full">
                <Text className="text-center text-secondary">{index + 1}</Text>
              </View>
              {mode === 0 ? (
                <>
                  <Controller
                    control={control}
                    name={`sets.${index}.reps`}
                    rules={{
                      required: true,
                      validate: (value) => {
                        if (value != null && !isNaN(value) && value > 0) {
                          return true;
                        }
                        return false;
                      },
                    }}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        className={`flex-1 ${
                          errors.sets?.[index]?.reps != null
                            ? "border-destructive"
                            : ""
                        }`}
                        autoComplete="off"
                        autoCapitalize="none"
                        keyboardType="numeric"
                        placeholder="Reps"
                        value={value?.toString() ?? ""}
                        onChangeText={onChange}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`sets.${index}.weight`}
                    rules={{
                      required: true,
                      validate: (value) => {
                        if (value != null && !isNaN(value)) {
                          return true;
                        }
                        return false;
                      },
                    }}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        className={`flex-1 ${
                          errors.sets?.[index]?.weight != null
                            ? "border-destructive"
                            : ""
                        }`}
                        autoComplete="off"
                        autoCapitalize="none"
                        keyboardType="numeric"
                        placeholder="Weight"
                        value={value?.toString() ?? ""}
                        onChangeText={onChange}
                      />
                    )}
                  />
                </>
              ) : (
                <Controller
                  control={control}
                  name={`sets.${index}.duration`}
                  rules={{
                    required: true,
                    minLength: 1,
                    maxLength: 8,
                    pattern: /^([0-9]{2}:)([0-5][0-9]:)([0-5][0-9])/,
                  }}
                  render={({ field: { onChange, value } }) => (
                    <WorkoutTimeSelector
                      defaultTime={value}
                      onChange={onChange}
                    />
                  )}
                />
              )}
              {index > 0 ? (
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
              ) : (
                <View className="flex w-10 text-lg"></View>
              )}
            </View>
            {errors.sets?.length && errors.sets[index] != null ? (
              <Text className="text-destructive ml-12">
                {mode === 0
                  ? "Please fill in all fields"
                  : "Please check format"}
              </Text>
            ) : null}
          </CardContent>
        ))}
      </ScrollView>
      <CardContent>
        <Separator />
      </CardContent>
      {/* Footer */}
      <CardFooter className="flex-col gap-y-2">
        <Button
          className="w-full"
          onPress={() => {
            addSet();
            clearErrors();
            scrollViewRef.current?.scrollToEnd();
          }}
          disabled={fields.length >= 15}
        >
          <Text>Add Set</Text>
        </Button>
        <View className="flex-row w-full justify-center items-center gap-x-2">
          <Button
            className="flex-1"
            variant={"destructive"}
            onPress={() => {
              replace([
                {
                  id: -1,
                  workout_id: 0,
                  order: fields.length,
                  reps: null,
                  weight: null,
                  duration: null,
                },
              ]);
              clearErrors();
            }}
          >
            <Text>Clear Sets</Text>
          </Button>
          <Button className="flex-1" onPress={handleSubmit(validateAndSubmit)}>
            <Text>Save</Text>
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
