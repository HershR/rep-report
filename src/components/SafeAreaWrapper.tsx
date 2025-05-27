import { View } from "react-native";
import React, { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { twMerge } from "tailwind-merge";
import { useHeaderHeight } from "@react-navigation/elements";

interface Props {
  children?: ReactNode;
}
const SafeAreaWrapper = ({ children }: Props) => {
  const headerHeight = useHeaderHeight();

  return (
    <View
      className={"relative flex-1 bg-background"}
      style={{ paddingTop: headerHeight }}
    >
      <SafeAreaView className={"border-2 flex-1 mx-8 my-5 md:mx-16"}>
        {children}
      </SafeAreaView>
    </View>
  );
};

export default SafeAreaWrapper;
