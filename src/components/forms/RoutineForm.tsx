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
const RoutineForm = () => {
  const router = useRouter();
  const hasVisited = useRef(false); // <-- Track visit state
  const [searchModalVisble, setSearchModalVisible] = useState(false);
  const goToExercise = (id: number) => {
    console.log("Navigating to exercise with ID:", id);
    setSearchModalVisible(false);
    setTimeout(() => {
      router.push(`/exercise/${id}`);
    }, 300);
  };
  useFocusEffect(
    useCallback(() => {
      if (hasVisited.current) {
        // Only show modal again if coming back
        const timeout = setTimeout(() => setSearchModalVisible(true), 100);
        return () => clearTimeout(timeout);
      } else {
        // First visit, mark as visited but do nothing
        hasVisited.current = true;
      }
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
          <Text className="font-semibold">Description:</Text>
          <Textarea placeholder="Enter Description" />
        </CardContent>
        <CardContent>
          <Text className="font-semibold">Exercises:</Text>
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
        <CardFooter className="flex flex-col gap-y-2">
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
          console.log(exercise);
          setSearchModalVisible(false);
        }}
        onShowExercise={goToExercise}
      />
    </>
  );
};

export default RoutineForm;
