import React, { useEffect, useState } from "react";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import * as schema from "@/src//db/schema";
import { useSQLiteContext } from "expo-sqlite";
import { Separator } from "@/src/components/ui/separator";
import { FlatList, TextInput, View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { createWeightEntry, deleteWeightEntry } from "@/src/db/dbHelpers";
import ActivityLoader from "@/src/components/ActivityLoader";
import { Plus } from "@/src/lib/icons/Plus";
import { CircleX } from "@/src/lib/icons/CircleX";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { CalendarDays } from "@/src/lib/icons/CalendarDays";

const WeightHistory = () => {
  const [weight, setWeight] = useState(0);
  const [date, setDate] = useState(new Date());
  const [dateModalVisible, setDateModalVisible] = useState(false);

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

  useEffect(() => {
    if (weightHistory && weightHistory.length > 0) {
      setWeight(weightHistory[0].weight);
    }
  }, [weightHistory]);

  const addWeightEntry = async (weight: number) => {
    try {
      await createWeightEntry(drizzleDb, weight, date);
    } catch (error) {
      console.error("Error creating weight entry:", error);
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
        <CardHeader className="flex gap-x-2">
          <CardTitle>Add Entry</CardTitle>
          <View className="flex-row items-center">
            <Text className="text-xl font-semibold">
              {date.toLocaleDateString(undefined, dateOptions)}
            </Text>
            <Button
              variant={"ghost"}
              size={"icon"}
              onPress={() => setDateModalVisible(true)}
            >
              <CalendarDays className="color-primary" size={30} />
            </Button>
          </View>
        </CardHeader>
        <CardContent>
          <View className="flex-row justify-center items-center gap-x-2">
            <TextInput
              className="flex-1 justify-center items-center rounded-md border border-input bg-background px-3 pb-0 text-6xl font-bold text-center"
              placeholderClassName="text-sm"
              keyboardType="numeric"
              textAlign="center"
              value={weight ? weight.toString() : ""}
              onChangeText={(text) => setWeight(parseFloat(text))}
            />
            <Text className="text-6xl font-semibold self-end"> Lb </Text>
            <Button
              variant={"outline"}
              size="icon"
              className="rounded-full w-12 h-12"
              onPress={() => {
                addWeightEntry(weight);
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
                  <Text key={weight.id} className="text-xl font-bold">
                    {weight.weight.toString() + " lb"}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
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
