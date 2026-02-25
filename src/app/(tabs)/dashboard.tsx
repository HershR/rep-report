import ExpandableCalendarScreen from '@/components/ExpandableCalendarScreen';
import StyledSafeAreaView from '@/components/StyledSafeAreaView';
import { View } from 'react-native';
export default function Dashboard() {
  return (
    <View className="flex-1">
      <StyledSafeAreaView className="flex-1 p-6 pb-2">
        <ExpandableCalendarScreen weekView={false} />
      </StyledSafeAreaView>
    </View>
  );
}
