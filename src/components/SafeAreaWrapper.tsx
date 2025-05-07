import { View } from "react-native";
import React, { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { twMerge } from "tailwind-merge";

interface Props {
  children?: ReactNode;
  style?: string;
}
const SafeAreaWrapper = ({ children, style }: Props) => {
  return (
    <View className="flex-1 bg-secondary">
      <SafeAreaView
        className={twMerge("flex-1 mx-8 mt-5 md:mx-16", style)}
        //
      >
        {children}
      </SafeAreaView>
    </View>
  );
};

export default SafeAreaWrapper;
