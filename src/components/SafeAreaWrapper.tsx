import { View, Text } from "react-native";
import React, { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
interface Props {
  children?: ReactNode;
}
const SafeAreaWrapper = ({ children }: Props) => {
  return (
    <View className="flex-1 bg-secondary">
      <SafeAreaView className="flex-1 mx-8 mt-10 mb-5 md:mx-16">
        {children}
      </SafeAreaView>
    </View>
  );
};

export default SafeAreaWrapper;
