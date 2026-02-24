import StyledSafeAreaView from '@/components/StyledSafeAreaView';
import { Input } from '@/components/ui/input';
import React from 'react';
import { Text, View } from 'react-native';
export default function Search() {
  return (
    <View className="flex-1">
      <StyledSafeAreaView className="flex-1 p-6 pb-2">
        <View>
          <Text className="text-3xl font-bold sm:text-lg lg:text-xl">Find Exercise</Text>
        </View>
        <View className="relative mt-4 flex-row items-center">
          {/* <SI className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={20} /> */}
          <Input placeholder="Search Exercises" className="w-full bg-gray-100 pl-12" />
        </View>
      </StyledSafeAreaView>
    </View>
  );
}
