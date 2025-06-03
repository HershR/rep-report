import { DateTime } from "luxon";
import React, { useState } from "react";
import { FlatList, TextInput, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ActivityLoader from "@/src/components/ActivityLoader";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import { useMeasurementUnit } from "@/src/context/MeasurementUnitContext";
//db
import * as schema from "@/src/db/schema";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import { createWeightEntry, deleteWeightEntry } from "@/src/db/dbHelpers";
//ui
import { Separator } from "@/src/components/ui/separator";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Plus } from "@/src/lib/icons/Plus";
import { CircleX } from "@/src/lib/icons/CircleX";
import { CalendarDays } from "@/src/lib/icons/CalendarDays";
//utils
import { UNIT_LABELS } from "@/src/constants/measurementLables";
import {
  convertWeight,
  convertWeightString,
} from "@/src/utils/measurementConversion";

const WeightHistory = () => {
  const [weight, setWeight] = useState<string | null>(null);
  const [date, setDate] = useState(
    DateTime.now()
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .toJSDate()
  );
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const { unit } = useMeasurementUnit();
  const regex = /^\d{0,4}(\.\d?)?$/;

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const {
    data: weightHistory,
    error: weightError,
    updatedAt: weightLoaded,
  } = useLiveQuery(
    drizzleDb.query.weightHistory.findMany({
      orderBy: (weight_history, { desc }) => [
        desc(weight_history.date_created),
      ],
    })
  );

  const addWeightEntry = async (weight: number) => {
    try {
      await createWeightEntry(
        drizzleDb,
        convertWeight(weight, unit, "imperial"),
        date.toISOString()
      );
    } catch (error) {
      console.error("Error creating weight entry:", error);
    }
  };

  const handleWeightChange = (value: string) => {
    const trimmed = value.trim();
    if (value === "") {
      setWeight(null);
      return;
    }
    if (!regex.test(trimmed)) return;
    let num = parseFloat(trimmed);
    if (unit === "imperial" && num > 999.9) {
      num = num / 10;
      setWeight(num.toFixed(1));
    } else if (unit === "metric" && num > 453.5) {
      num = Math.min(num, 453.5);
      setWeight(num.toString());
    } else {
      setWeight(trimmed);
    }
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: undefined,
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return (
    <SafeAreaWrapper>
      <Card className="flex-1">
        <CardHeader>
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-semibold">
              {date.toLocaleDateString(undefined, dateOptions)}
            </Text>
            <Button
              className="ml-2"
              variant={"ghost"}
              size={"icon"}
              onPress={() => setDateModalVisible(true)}
            >
              <CalendarDays className="color-primary" size={24} />
            </Button>
          </View>
        </CardHeader>
        <CardContent>
          <View className="flex-row justify-center items-center gap-x-2">
            <TextInput
              className="flex-1 text-primary justify-center items-center rounded-md border border-input bg-background px-3 pb-0 text-6xl font-bold text-center"
              placeholderClassName="text-sm"
              keyboardType="numeric"
              textAlign="center"
              value={weight || ""}
              onChangeText={(text) => handleWeightChange(text)}
              maxLength={5}
            />
            <Text className="text-6xl font-medium self-end">
              {" "}
              {unit === "metric"
                ? UNIT_LABELS.metric.weight
                : UNIT_LABELS.imperial.weight}{" "}
            </Text>
            <Button
              variant={"outline"}
              size="icon"
              className="rounded-full w-12 h-12"
              onPress={() => {
                if (weight !== null) {
                  addWeightEntry(parseFloat(weight));
                }
                setWeight(null);
              }}
            >
              <Plus className="color-primary" size={40} />
            </Button>
          </View>
        </CardContent>
        <CardContent>
          <Separator />
        </CardContent>
        <CardContent className="flex-1 gap-y-2">
          <CardTitle>History</CardTitle>

          {weightError ? (
            <Text>Error loading weight history: {weightError.message}</Text>
          ) : weightLoaded ? (
            <FlatList
              data={weightHistory}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item: weight }) => (
                <View
                  key={weight.id}
                  className="flex-row items-center justify-between"
                >
                  <Text key={weight.id} className="flex-1 text-xl font-bold">
                    {convertWeightString(weight.weight, "imperial", unit)}
                  </Text>
                  <Text className="flex-1 text-sm text-muted-foreground">
                    {new Date(weight.date_created).toLocaleDateString(
                      undefined,
                      dateOptions
                    )}
                  </Text>
                  <Button
                    className="rounded-full w-10 h-10"
                    variant={"ghost"}
                    size="icon"
                    onPress={async () => {
                      deleteWeightEntry(drizzleDb, weight.id);
                    }}
                  >
                    <CircleX className="color-destructive" size={30} />
                  </Button>
                </View>
              )}
              ItemSeparatorComponent={() => <Separator className="my-2" />}
              ListEmptyComponent={() => (
                <Text className="text-lg">No weight history</Text>
              )}
            ></FlatList>
          ) : (
            <ActivityLoader />
          )}
        </CardContent>
      </Card>
      <DateTimePickerModal
        isVisible={dateModalVisible}
        mode="date"
        date={date}
        onConfirm={(date) => {
          setDate(date);
          setDateModalVisible(false);
        }}
        onCancel={() => setDateModalVisible(false)}
      />
    </SafeAreaWrapper>
  );
};

export default WeightHistory;
