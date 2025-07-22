import { View } from "react-native";
import React from "react";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { ChevronRight } from "../lib/icons/ChevronRight";
interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationButtons = ({
  currentPage,
  totalPages,
  onPageChange,
}: Props) => {
  const getPageNumbers = () => {
    const maxButtons = 6;
    if (totalPages <= maxButtons) {
      return Array.from(
        { length: Math.min(totalPages, maxButtons) },
        (_, i) => i
      );
    }
    const items = [];
    items.push(0);
    items.push(1);
    if (1 < currentPage - 1) {
      items.push("...");
      if (currentPage - 1 < totalPages - 2) {
        items.push(currentPage - 1);
      }
    }
    if (1 < currentPage && currentPage < totalPages - 2) {
      items.push(currentPage);
    }
    if (currentPage + 1 < totalPages - 2) {
      if (1 < currentPage + 1) {
        items.push(currentPage + 1);
      }
      items.push("...");
    }
    items.push(totalPages - 2);
    items.push(totalPages - 1);
    return items;
  };

  const pageNumbers = getPageNumbers();

  return (
    <View className="justify-center items-center">
      <View className="flex-row w-full max-w-sm justify-between items-center gap-x-2">
        <Button
          onPress={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          size={"icon"}
        >
          <ChevronRight className="color-secondary rotate-180" />
        </Button>
        <View className="flex-1 flex-row justify-center">
          {pageNumbers.map((page, index) =>
            typeof page === "number" ? (
              <Button
                key={page}
                onPress={() => onPageChange(page)}
                variant={currentPage !== page ? "ghost" : "default"}
                size={"icon"}
              >
                <Text>{page + 1}</Text>
              </Button>
            ) : (
              <View key={`${page}_${index}`} className="justify-center">
                <Text className="font-bold">{page}</Text>
              </View>
            )
          )}
        </View>
        <Button
          onPress={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          size={"icon"}
        >
          <ChevronRight className="color-secondary" />
        </Button>
      </View>
    </View>
  );
};

export default PaginationButtons;
