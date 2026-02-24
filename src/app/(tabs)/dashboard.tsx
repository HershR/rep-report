import StyledSafeAreaView from '@/components/StyledSafeAreaView';
import { Text, View } from 'react-native';

export default function Dashboard() {
  return (
    <View className="flex-1">
      <StyledSafeAreaView className="flex-1 p-6 pb-2">
        <View>
          <Text className="text-3xl font-bold sm:text-lg lg:text-xl">Exercise</Text>
        </View>
      </StyledSafeAreaView>
    </View>
  );
}
