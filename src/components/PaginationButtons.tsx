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
    const maxButtons = 5;
    let start = Math.max(0, currentPage - Math.floor(maxButtons / 2));
    let end = start + maxButtons;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(0, end - maxButtons);
    }

    const items = Array.from({ length: end - start }, (_, i) => start + i);
    return items;
  };

  const pageNumbers = getPageNumbers();

  return (
    <View className="flex-row w-full max-w-sm justify-center items-center gap-x-2">
      <Button
        className="flex-1 p-2 "
        onPress={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        size={"icon"}
      >
        <ChevronRight className="color-secondary rotate-180" />
      </Button>

      {pageNumbers.map((page) => (
        <Button
          className="flex-1 "
          key={page}
          onPress={() => onPageChange(page)}
          variant={currentPage !== page ? "outline" : "default"}
        >
          <Text>{page + 1}</Text>
        </Button>
      ))}

      <Button
        className="flex-1 p-2 "
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        size={"icon"}
      >
        <ChevronRight className="color-secondary" />
      </Button>
    </View>
  );
};

export default PaginationButtons;
