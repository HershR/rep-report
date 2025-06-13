import React from "react";

import SafeAreaWrapper from "@/src/components/SafeAreaWrapper";
import AllExerciseSearch from "@/src/components/search/AllExerciseSearch";
const Search = () => {
  return (
    <SafeAreaWrapper hasTabBar>
      <AllExerciseSearch />
    </SafeAreaWrapper>
  );
};

export default Search;
