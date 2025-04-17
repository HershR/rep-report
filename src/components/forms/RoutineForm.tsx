import React, { useCallback, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { Textarea } from "../ui/textarea";
import { Plus } from "@/src/lib/icons/Plus";
import SearchModal from "../SearchModal";
import { useFocusEffect, useRouter } from "expo-router";
import { FlatList, View } from "react-native";
import { Trash2 } from "@/src/lib/icons/Trash2";
import { Separator } from "../ui/separator";
const RoutineForm = () => {
  const router = useRouter();
  const hasVisited = useRef(false); // <-- Track visit state
  const [searchModalVisble, setSearchModalVisible] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]); // <-- Track selected exercises
  const goToExercise = (id: number) => {
    console.log("Navigating to exercise with ID:", id);
    setSearchModalVisible(false);
    setTimeout(() => {
      router.push(`/exercise/${id}`);
    }, 300);
  };
  useFocusEffect(
    useCallback(() => {
      // if (hasVisited.current) {
      //   // Only show modal again if coming back
      //   const timeout = setTimeout(() => setSearchModalVisible(true), 100);
      //   return () => clearTimeout(timeout);
      // } else {
      //   // First visit, mark as visited but do nothing
      //   hasVisited.current = true;
      // }
    }, [])
  );
  return (
    <>
      <Card className="flex-1 w-full">
        <CardHeader>
          <CardTitle>Create Routine</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Name */}
          {/* Add input for routine name */}
          {/* Description */
          /* Add input for routine description */}
          {/* Exercises */}
          {/* Add a list of exercises with options to add/remove */}
          {/* Save button */}
          <Text className="font-semibold">Name:</Text>
          <Input placeholder="Enter Name" />
        </CardContent>
        <CardContent>
          <Separator />
        </CardContent>

        <CardContent>
          <Text className="font-semibold">Description:</Text>
          <Textarea placeholder="Enter Description" />
        </CardContent>
        <CardContent>
          <Separator />
        </CardContent>
        <CardContent className="flex-1 gap-y-4">
          <Text className="font-semibold">Exercises:</Text>
          <FlatList
            data={selectedExercises}
            keyExtractor={(item, index) => `${index}_${item.id}`}
            contentContainerClassName="gap-y-2"
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <View className="flex-row w-full justify-between items-center px-2">
                <View className="flex-row gap-x-4">
                  <View className="w-8 h-8 justify-center items-center bg-primary rounded-full">
                    <Text className="text-center text-secondary">
                      {index + 1}
                    </Text>
                  </View>
                  <Text numberOfLines={1} className="text-xl">
                    {item.name}
                  </Text>
                </View>
                <Button
                  variant="destructive"
                  size={"icon"}
                  onPress={() =>
                    setSelectedExercises((prev) =>
                      prev.filter((ex) => ex.id !== item.id)
                    )
                  }
                >
                  <Trash2 className="color-secondary" size={20} />
                </Button>
              </View>
            )}
          />
          <Button
            className="flex-row w-full justify-center items-center mb-2"
            variant={"outline"}
            onPress={() => setSearchModalVisible(true)}
          >
            <Text>Add Exercise</Text>
            <Plus className="color-primary" size={20} />
          </Button>

          {/* This is where you would map through exercises and display them */}
          {/* For now, we can just add a placeholder input */}
        </CardContent>
        <CardContent>
          <Separator />
        </CardContent>

        <CardFooter className="flex flex-col justify-end gap-y-2">
          <Button className="w-full">
            <Text>Save</Text>
          </Button>
          <Button className="w-full" variant="outline">
            <Text>Cancel</Text>
          </Button>
        </CardFooter>
      </Card>
      <SearchModal
        visible={searchModalVisble}
        onClose={() => setSearchModalVisible(false)}
        onSelectExercise={(exercise: Exercise) => {
          setSearchModalVisible(false);
          setSelectedExercises((prev) => [...prev, exercise]);
        }}
        onShowExercise={goToExercise}
      />
    </>
  );
};

export default RoutineForm;
