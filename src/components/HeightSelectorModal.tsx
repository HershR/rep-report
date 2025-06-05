import { View, Modal, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { SafeAreaView } from "react-native-safe-area-context";
import HeightSelector from "./HeightSelector";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
interface HeightSelectorModalProps {
  isVisable: boolean;
  defaultHeight: number;
  unit: Unit;
  onSubmit: (height: number) => void;
  onClose: () => void;
}
const HeightSelectorModal = ({
  isVisable,
  defaultHeight,
  unit,
  onSubmit,
  onClose,
}: HeightSelectorModalProps) => {
  const [height, setHeight] = useState(defaultHeight);
  return (
    <Modal
      visible={isVisable}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="absolute left-0 top-0 right-0 bottom-0 bg-black/50"
        onPress={onClose}
      ></TouchableOpacity>
      <SafeAreaView className="flex-1 justify-center items-center my-4">
        <Card className="flex w-full max-w-sm">
          <CardHeader>
            <CardTitle>Update Height</CardTitle>
          </CardHeader>
          <CardContent>
            <HeightSelector
              heightCm={height}
              unit={unit}
              onChange={(height) => setHeight(height)}
            />
          </CardContent>
          <CardFooter className="gap-x-4">
            <Button
              className="flex-1"
              variant={"destructive"}
              onPress={() => {
                console.log("press close button");
                onClose();
              }}
            >
              <Text>Close</Text>
            </Button>
            <Button className="flex-1" onPress={() => onSubmit(height)}>
              <Text>Save</Text>
            </Button>
          </CardFooter>
        </Card>
      </SafeAreaView>
    </Modal>
  );
};
export default HeightSelectorModal;
