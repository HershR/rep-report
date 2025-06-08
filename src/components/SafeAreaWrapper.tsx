import { View } from "react-native";
import React, { ReactNode } from "react";
import { Edges, SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { twMerge } from "tailwind-merge";

interface Props {
  children?: ReactNode;
  hasHeader?: boolean;
  hasTabBar?: boolean;
}
const SafeAreaWrapper = ({
  children,
  hasHeader = false,
  hasTabBar = false,
}: Props) => {
  let edges: Edges = ["left", "right"];
  const headerHeight = useHeaderHeight();
  if (!hasHeader) {
    edges = [...edges, "top"];
  }
  if (!hasTabBar) {
    edges = [...edges, "bottom"];
  }

  //Testing
  const debug = false;
  return (
    <SafeAreaView
      edges={edges}
      className={twMerge("relative flex-1", debug && "bg-red-500")}
    >
      <View className="flex-1">
        <View
          className={twMerge(
            "flex-1 mx-8 my-5 md:mx-16",
            debug && "bg-blue-500"
          )}
          style={{
            marginTop: hasHeader ? headerHeight + 10 : 20,
          }}
        >
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SafeAreaWrapper;
