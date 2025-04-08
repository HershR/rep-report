import React from "react";
import { Badge } from "./ui/badge";
import { Text } from "./ui/text";
interface Props {
  item: { id: number | string; name: string };
  disabled: boolean;
  onPress?: () => void;
}
export const SearchChip = ({ item, onPress, disabled = true }: Props) => {
  return (
    <Badge
      className="justify-center items-center px-4 min-h-14"
      variant={"default"}
      key={item?.id}
    >
      <Text disabled={disabled} className="text-md font-normal">
        {item?.name}
      </Text>
    </Badge>
  );
};
