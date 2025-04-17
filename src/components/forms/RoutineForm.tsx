import { View } from "react-native";
import React, { useEffect, useState } from "react";
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
import { Separator } from "../ui/separator";
import { Plus } from "@/src/lib/icons/Plus";
import SearchModal from "../SearchModal";
import useFetch from "@/src/services/useFetch";
import { searchExercise } from "@/src/services/api";
import { SelectItem } from "../ui/select";
import wgerCategories from "@/src/constants/excerciseCategory";
const RoutineForm = () => {
  const [searchModalVisble, setSearchModalVisible] = useState(false);
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
      />
    </>
  );
};

export default RoutineForm;
