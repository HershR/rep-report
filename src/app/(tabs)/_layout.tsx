import { Tabs } from "expo-router";
import React from "react";

const _Layout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="search" />
    </Tabs>
  );
};
export default _Layout;
