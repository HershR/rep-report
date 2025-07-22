import { View } from "react-native";
import React, { ReactNode } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { twMerge } from "tailwind-merge";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

interface Props {
  children?: ReactNode;
  viewStyle?: string;
  hasHeader?: boolean;
  hasTabBar?: boolean;
}
const SafeAreaWrapper = ({
  children,
  hasHeader,
  hasTabBar,
  viewStyle = "",
}: Props) => {
  const insets = useSafeAreaInsets();
  let tabHeight = 0;
  if (hasTabBar) {
    tabHeight = useBottomTabBarHeight();
  }
  //Testing

  const debug = false;
  if (debug) {
    console.log("SafeAreaWrapper", insets, {
      tabHeight,
    });
  }
  return (
    <View className={twMerge("relative flex-1", debug && "bg-red-500")}>
      <View
        style={{
          paddingTop: hasHeader ? 0 : insets.top,
          paddingBottom: insets.bottom + tabHeight,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
        className={twMerge(
          "flex-1 mx-8 md:mx-16",

          viewStyle,
          debug && "bg-blue-500"
        )}
      >
        {children}
      </View>
    </View>
  );
};

export default SafeAreaWrapper;
