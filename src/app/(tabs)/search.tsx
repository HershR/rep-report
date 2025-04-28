import { View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import useFetch from "@/src/services/useFetch";
import { searchExercise } from "@/src/services/api";
import SearchBar from "@/src/components/SearchBar";
import { wgerCategories } from "@/src/constants/excerciseCategory";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Text } from "@/src/components/ui/text";
import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import ExerciseList from "@/src/components/lists/ExerciseList";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import ExerciseNameSearch from "@/src/components/search/ExerciseNameSearch";
const Search = () => {
  const [value, setValue] = React.useState("search");

  return (
    <SafeAreaWrapper>
      <Tabs
        value={value}
        onValueChange={setValue}
        className="w-full mx-auto flex-col gap-1.5 items-center"
      >
        <TabsList className="flex-row w-full max-w-[400px] ">
          <TabsTrigger value="search" className="flex-1">
            <Text>Search</Text>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex-1">
            <Text>Advanced</Text>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="search">
          <ExerciseNameSearch />
        </TabsContent>
        <TabsContent value="advanced"></TabsContent>
      </Tabs>
    </SafeAreaWrapper>
  );
};

export default Search;
