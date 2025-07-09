import { View } from "react-native";
import React, { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { twMerge } from "tailwind-merge";
import Header from "./Header";
import SafeAreaWrapper from "./SafeAreaWrapper";

interface Props {
  children?: ReactNode;
  title: string;
  viewStyle?: string;
}
const SafeAreaWithHeader = ({ children, title, viewStyle = "" }: Props) => {
  const debug = false;
  return (
    <View className={twMerge("relative flex-1", debug && "bg-red-500")}>
      <SafeAreaView className="flex bg-background shadow-primary shadow-xl dark:border-b border-primary/50">
        <Header title={title} />
      </SafeAreaView>
      <SafeAreaWrapper hasHeader viewStyle={viewStyle}>
        {children}
      </SafeAreaWrapper>
    </View>
  );
};

export default SafeAreaWithHeader;
