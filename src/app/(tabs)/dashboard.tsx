import CustomExpandableCalendar from '@/components/CustomExpandableCalendar';
import StyledSafeAreaView from '@/components/StyledSafeAreaView';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';
export default function Dashboard() {
  return (
    <View className="flex-1">
      <StyledSafeAreaView className="flex-1 border-2" edges={['top']}>
        <CustomExpandableCalendar weekView={false} />
      </StyledSafeAreaView>
      <StyledSafeAreaView className="flex-1 px-4 pb-2" edges={['left', 'right', 'bottom']}>
        {/* <ExpandableCalendarScreen weekView={false} /> */}
        {/* <WorkoutHistoryCalendar /> */}
        <Text className="mb-4 text-xl font-bold">Exercies</Text>
      </StyledSafeAreaView>
    </View>
  );
}
