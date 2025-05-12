import React from "react";

import { Text } from "@/src/components/ui/text";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import ExerciseNameSearch from "@/src/components/search/ExerciseNameSearch";
import AllExerciseSearch from "@/src/components/search/AllExerciseSearch";
const Search = () => {
  const [value, setValue] = React.useState("search");

  return (
    <SafeAreaWrapper>
      <Tabs value={value} onValueChange={setValue} className="flex-1">
        <TabsList className="flex-row w-full max-w-[400px] self-center">
          <TabsTrigger value="search" className="flex-1">
            <Text>Search</Text>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex-1">
            <Text>Advanced</Text>
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="search"
          forceMount={true}
          style={{
            display: value === "search" ? undefined : "none",
            flex: value === "search" ? 1 : 0,
          }}
        >
          <ExerciseNameSearch />
        </TabsContent>
        <TabsContent
          value="advanced"
          forceMount={true}
          style={{
            display: value === "advanced" ? undefined : "none",
            flex: value === "advanced" ? 1 : 0,
          }}
        >
          <AllExerciseSearch />
        </TabsContent>
      </Tabs>
    </SafeAreaWrapper>
  );
};

export default Search;
