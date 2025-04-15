import { View } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Text } from "@/src/components/ui/text";
const Saved = () => {
  const [tab, setTab] = useState("favorites");

  return (
    <View className="flex-1 bg-secondary">
      <SafeAreaView className="flex-1 mx-8 mt-10 pb-20">
        <Tabs
          value={tab}
          onValueChange={setTab}
          className="w-full max-w-[400px] mx-auto flex-col bg-background gap-1.5"
        >
          <TabsList className="flex-row w-full">
            <TabsTrigger value="favorites" className="flex-1">
              <Text>Favorites</Text>
            </TabsTrigger>
            <TabsTrigger value="routines" className="flex-1">
              <Text>Routines</Text>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </SafeAreaView>
    </View>
  );
};

export default Saved;
