import { View } from "react-native";
import React, { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { twMerge } from "tailwind-merge";

interface Props {
  children?: ReactNode;
  style?: string;
  backgroundColor?: string;
}
const SafeAreaWrapper = ({
  children,
  style,
  backgroundColor = "bg-background",
}: Props) => {
  return (
    <View className={"relative flex-1 " + backgroundColor}>
      <SafeAreaView
        edges={[]}
        className={twMerge(
          "flex-1 mx-8 my-5 md:mx-16 border-purple-500",
          style
        )}
      >
        {children}
      </SafeAreaView>
    </View>
  );
};

export default SafeAreaWrapper;
