import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { fetchExcercises } from '@/services/api';
import useFetch from '@/services/useFetch';
import { FlashList } from '@shopify/flash-list';
import { LucideIcon, Search as SI } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import ExerciseCard from './ExerciseCard';

function ExerciseSearchComponent() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const {
    data: searchResults,
    loading: searchResultsLoading,
    error,
    refetch: loadResults,
    reset,
  } = useFetch(
    () =>
      fetchExcercises({
        offset: 0,
        limit: 20,
        name: searchQuery.trim(),
      }).then((data) => {
        const res = data.results.filter(
          (x) => !!x.translations.find((y) => y.language === 2)?.name
        );
        return {
          results: res,
          count: res.length,
        };
      }),
    false
  );
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      await loadResults();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  const renderSearchResults = () => {
    if (searchResultsLoading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      );
    }
    if (error) {
      return (
        <Text className="text-destructive text-lg">
          Failed to load exercises. Please try again.
        </Text>
      );
    }
    if (searchResults?.results.length === 0) {
      return <Text className="text-muted-foreground text-lg">No Exercise Found</Text>;
    }

    return (
      <FlashList
        data={searchResults?.results}
        ItemSeparatorComponent={() => <View className="h-4 w-full" />}
        renderItem={({ item, index }) => {
          return <ExerciseCard key={index} {...item} />;
        }}
      />
    );
  };

  return (
    <>
      <View className="border-border flex-row items-center gap-2 rounded-lg border-2 px-4 py-2">
        <Icon as={SI as LucideIcon} className="text-muted-foreground" size={20} />
        <Input
          placeholder="Search Exercises"
          className="text-muted-foreground flex-1 border-0 bg-transparent shadow-none"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      {renderSearchResults()}
    </>
  );
}

export default ExerciseSearchComponent;
