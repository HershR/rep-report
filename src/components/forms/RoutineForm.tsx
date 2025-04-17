import { View } from "react-native";
import React from "react";
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
const RoutineForm = () => {
  return (
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
  );
};

export default RoutineForm;
