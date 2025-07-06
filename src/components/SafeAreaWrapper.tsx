import { View } from "react-native";
import React, { ReactNode } from "react";
import {
  Edges,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { twMerge } from "tailwind-merge";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

interface Props {
  children?: ReactNode;
  hasHeader?: boolean;
  hasTabBar?: boolean;
  viewStyle?: string;
}
const SafeAreaWrapper = ({
  children,
  hasHeader = false,
  hasTabBar = false,
  viewStyle = "",
}: Props) => {
  const headerHeight = useHeaderHeight();
  let tabHeight = 0;
  if (hasTabBar) {
    tabHeight = useBottomTabBarHeight();
  }
  const insets = useSafeAreaInsets();
  //Testing
  const marginTop = headerHeight + 20;
  const marginBottom = tabHeight + 20;

  const debug = false;
  if (debug) {
    console.log("SafeAreaWrapper", {
      headerHeight,
      tabHeight,
      marginTop,
      marginBottom,
    });
  }
  return (
    <View className={twMerge("relative flex-1", debug && "bg-red-500")}>
      <View
        style={{
          paddingTop: !hasHeader ? insets.top : 0,
          paddingBottom: !hasTabBar ? insets.bottom : 0,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          marginTop: marginTop,
          marginBottom: marginBottom,
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
