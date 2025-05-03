import { FlatList, View } from "react-native";
import React from "react";
import ExerciseCard from "../ExerciseCard";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import { formatList } from "@/src/utils/listFormatter";
interface Props {
  exercises: Omit<Exercise, "is_favorite">[] | null;
  emptyListComp?: any;
  footerComp?: any;
  onEndReach?: () => void;
}

const ExerciseList = ({
  exercises,
  emptyListComp,
  footerComp,
  onEndReach,
}: Props) => {
  const { width, height } = useSafeAreaFrame();
  const numColumns = width < 600 ? 2 : width < 1000 ? 3 : 4;

  return (
    <FlatList
      key={numColumns}
      numColumns={numColumns}
      data={formatList(exercises || [], numColumns)}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => (item.id ? item.id.toString() : item.key)}
      columnWrapperClassName="justify-start gap-x-4 my-2"
      contentContainerStyle={{ paddingBottom: 100 }}
      ListEmptyComponent={emptyListComp}
      onEndReachedThreshold={0.2}
      onEndReached={onEndReach}
      ListFooterComponent={footerComp}
      renderItem={({ item }) => {
        if (item.empty) {
          return <View className="flex-1"></View>;
        }
        return (
          <ExerciseCard
            exercise={item}
            containerClassname="flex-1 aspect-square"
          />
        );
      }}
    ></FlatList>
  );
};

export default ExerciseList;
