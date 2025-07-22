import { FlatList, View } from "react-native";
import React, { useState } from "react";
import ExerciseCard from "../ExerciseCard";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import { formatList } from "@/src/utils/listFormatter";
import PaginationButtons from "../PaginationButtons";
import Animated, { FadeIn } from "react-native-reanimated";
interface Props {
  exercises: Omit<Exercise, "is_favorite">[];
  emptyListComp?: any;
  currentPage?: number;
  pageSize?: number;
  animate?: boolean;
  onPageChange?: (page: number) => void;
}

const ExerciseList = ({
  exercises = [],
  currentPage = 0,
  pageSize = 999,
  emptyListComp,
  animate = false,
  onPageChange,
}: Props) => {
  const { width, height } = useSafeAreaFrame();
  const numColumns = width < 600 ? 2 : width < 1000 ? 3 : 4;
  pageSize = Math.ceil(pageSize / numColumns) * numColumns;
  const maxPages = Math.ceil((exercises?.length ?? 1) / pageSize);
  return (
    <FlatList
      className="w-full"
      contentContainerClassName="justify-center item-center"
      key={numColumns}
      numColumns={numColumns}
      data={formatList(exercises, numColumns).slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
      )}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      columnWrapperClassName="justify-start gap-x-4 my-2"
      ListEmptyComponent={emptyListComp}
      ListHeaderComponent={
        exercises?.length > pageSize ? (
          <PaginationButtons
            currentPage={currentPage}
            totalPages={maxPages}
            onPageChange={(page) => {
              onPageChange?.(page);
            }}
          />
        ) : null
      }
      ListFooterComponent={
        exercises?.length > pageSize ? (
          <PaginationButtons
            currentPage={currentPage}
            totalPages={maxPages}
            onPageChange={(page) => {
              onPageChange?.(page);
            }}
          />
        ) : null
      }
      renderItem={({ item }) => {
        if (item.empty) {
          return <View className="flex-1"></View>;
        }
        if (animate) {
          return (
            <Animated.View entering={FadeIn.duration(600)} className="flex-1">
              <ExerciseCard
                exercise={item}
                containerClassname="flex-1 aspect-square"
              />
            </Animated.View>
          );
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
