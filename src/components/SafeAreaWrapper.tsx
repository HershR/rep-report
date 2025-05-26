import { View } from "react-native";
import React, { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { twMerge } from "tailwind-merge";

interface Props {
  children?: ReactNode;
  style?: string;
  backgroundColor?: string;
  edges?: ("top" | "bottom" | "left" | "right")[];
}
const SafeAreaWrapper = ({
  children,
  style,
  backgroundColor = "bg-background",
  edges = [], //"left", "right", "bottom"
}: Props) => {
  return (
    <View className={"relative flex-1 bg-red-500" + backgroundColor}>
      <SafeAreaView
        edges={edges}
        className={twMerge(
          "border-2 border-green-500 flex-1 mx-8 my-5 md:mx-16",
          style
        )}
      >
        {children}
      </SafeAreaView>
    </View>
  );
};

export default SafeAreaWrapper;
