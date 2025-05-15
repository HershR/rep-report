import React, { useState } from "react";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import * as schema from "@/src//db/schema";
import { useSQLiteContext } from "expo-sqlite";
import { Separator } from "@/src/components/ui/separator";
import {
  FlatList,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button } from "@/src/components/ui/button";
import { createWeightEntry } from "@/src/db/dbHelpers";
import ActivityLoader from "@/src/components/ActivityLoader";
import { Plus } from "@/src/lib/icons/Plus";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@/src/components/ui/input";

interface WeightModalProps {
  visible: boolean;
  currentWeight: number;
  onClose: () => void;
  onSelectWeight: (weight: number) => void;
}

const WeightModal = ({
  visible,
  currentWeight,
  onClose,
  onSelectWeight,
}: WeightModalProps) => {
  const [weight, setWeight] = useState(currentWeight);

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <TouchableOpacity
        className="absolute left-0 top-0 right-0 bottom-0  bg-black/50"
        onPress={onClose}
      >
        <View className="flex-1 justify-center items-center">
          <TouchableWithoutFeedback onPress={() => {}}>
            <Card className="w-full max-w-sm md:max-w-md">
              <CardHeader className="gap-y-4"></CardHeader>
              <CardContent className="justify-center gap-x-2">
                {/* <Text className="text-6xl font-bold self-center">
                  {currentWeight.toString() + " lb"}
                </Text> */}
                <View className="h-28">
                  <Input
                    className="flex-1 text-4xl font-bold"
                    placeholder="Enter weight"
                    keyboardType="numeric"
                    textAlign="center"
                    value={weight.toString()}
                    onChangeText={(text) => setWeight(parseFloat(text))}
                  ></Input>
                </View>
              </CardContent>
              <CardFooter className="flex-row justify-center gap-x-2">
                <Button onPress={onClose}>
                  <Text>Close</Text>
                </Button>
                <Button>
                  <Text>Save</Text>
                </Button>
              </CardFooter>
            </Card>
          </TouchableWithoutFeedback>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const WeightHistory = () => {
  const [modalVisible, setModalVisible] = React.useState(false);

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
      await createWeightEntry(drizzleDb, weight);
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
        <CardHeader className="gap-y-4">
          <CardTitle>Current Weight</CardTitle>
        </CardHeader>
        <CardContent className="flex-row justify-center gap-x-2">
          <Text className="text-6xl font-bold self-center">
            {weightHistory.length > 0
              ? weightHistory[0].weight.toString() + " lb"
              : "NA"}
          </Text>
          <Button
            variant={"outline"}
            size="icon"
            className="rounded-full w-12 h-12"
            onPress={() => {
              setModalVisible(true);
            }}
          >
            <Plus className="color-primary" size={40} />
          </Button>
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
        <CardContent>
          <Button
            onPress={() => {
              addWeightEntry(Math.floor(Math.random() * 100) + 100);
            }}
          >
            <Text>Add Random Weight</Text>
          </Button>
        </CardContent>
      </Card>
      <WeightModal
        visible={modalVisible}
        currentWeight={weightHistory.length > 0 ? weightHistory[0].weight : 0}
        onClose={() => setModalVisible(false)}
        onSelectWeight={(weight) => {
          addWeightEntry(weight);
          setModalVisible(false);
        }}
      />
    </SafeAreaWrapper>
  );
};

export default WeightHistory;
