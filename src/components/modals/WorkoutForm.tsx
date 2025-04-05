import { View, Text, useWindowDimensions } from "react-native";
import React from "react";
import { ExerciseInfo } from "@/src/interfaces/interface";
import { removeHTML, toUpperCase } from "@/src/services/textFormatter";
import { SearchChip } from "../SearchChip";

interface Props {
  exercise: ExerciseInfo | null;
  date: string;
}

const WorkoutForm = ({ date, exercise }: Props) => {
  const { width } = useWindowDimensions();
  const translation = exercise?.translations.find((x) => x.language === 2);
  const name = toUpperCase(translation?.name);
  const desciption = removeHTML(translation?.description);
  const equipment = exercise?.equipment.map((x) => (
    <SearchChip
      key={x.id}
      item={x}
      disabled={true}
      onPress={function (): void {
        throw new Error("Function not implemented.");
      }}
    />
  ));
  return <View></View>;
};

export default WorkoutForm;
