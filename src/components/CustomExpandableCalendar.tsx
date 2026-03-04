import React, { useCallback, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, View } from 'react-native';
import { CalendarProvider, ExpandableCalendar, WeekCalendar } from 'react-native-calendars';
// import { agendaItems, getMarkedDates } from '../mocks/agendaItems';
import { useDate } from '@/hooks/useDate';
import { formatDate } from '@/lib/dateUtils';
import DatePicker from 'react-native-date-picker';
import { getTheme, themeColor } from '../lib/calanderTheme';
import { Button } from './ui/button';
import { Text } from './ui/text';
const leftArrowIcon = require('@/assets/images/previous.png');
const rightArrowIcon = require('@/assets/images/next.png');
// const ITEMS: any[] = agendaItems;

interface Props {
  weekView?: boolean;
  children?: React.ReactNode;
}
const CHEVRON = require('@/assets/images/next.png');
const CustomExpandableCalendar = ({ weekView, children }: Props) => {
  const [open, setOpen] = React.useState(false);
  const theme = useRef(getTheme());
  const { currentLocalDate, updateLocalDate } = useDate()!;
  const todayBtnTheme = useRef({
    todayButtonTextColor: themeColor,
  });

  const calendarRef = useRef<{ toggleCalendarPosition: () => boolean }>(null);
  const rotation = useRef(new Animated.Value(0));

  const toggleCalendarExpansion = useCallback(() => {
    const isOpen = calendarRef.current?.toggleCalendarPosition();
    Animated.timing(rotation.current, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }, []);

  const renderHeader = useCallback(
    (date?: Date) => {
      const rotationInDegrees = rotation.current.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-180deg'],
      });
      return (
        <View className="flex-row items-center justify-between">
          <Button
            variant={'outline'}
            className="items-center justify-center"
            onPress={() => setOpen(true)}>
            <Text className="text-primary text-xl font-semibold">
              {formatDate(currentLocalDate, 'MMMM DD YYYY')}
            </Text>
          </Button>
          <Button variant={'ghost'} onPress={toggleCalendarExpansion}>
            <Animated.Image
              source={CHEVRON}
              style={{ transform: [{ rotate: '90deg' }, { rotate: rotationInDegrees }] }}
            />
          </Button>
        </View>
      );
    },
    [toggleCalendarExpansion, currentLocalDate]
  );

  const onCalendarToggled = useCallback(
    (isOpen: boolean) => {
      rotation.current.setValue(isOpen ? 1 : 0);
    },
    [rotation]
  );

  if (currentLocalDate === null || currentLocalDate === undefined)
    return <ActivityIndicator size="large" className="flex-1" />;
  return (
    <>
      <CalendarProvider
        date={currentLocalDate}
        onDateChanged={updateLocalDate}
        disabledOpacity={0.6}
        theme={todayBtnTheme.current}>
        {weekView ? (
          <WeekCalendar testID={'CalendarWeek'} firstDay={1} />
        ) : (
          <ExpandableCalendar
            testID={'CalendarExpandable'}
            renderHeader={renderHeader}
            ref={calendarRef}
            onCalendarToggled={onCalendarToggled}
            disablePan
            hideKnob
            initialPosition={ExpandableCalendar.positions.CLOSED}
            theme={theme.current}
            firstDay={1}
            leftArrowImageSource={leftArrowIcon}
            rightArrowImageSource={rightArrowIcon}
            animateScroll
            closeOnDayPress
            allowShadow={false}
          />
        )}
        {children}
      </CalendarProvider>
      <DatePicker
        modal
        open={open}
        date={new Date(currentLocalDate)}
        onConfirm={(date: Date) => {
          setOpen(false);
          updateLocalDate(date.toISOString().split('T')[0]);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </>
  );
};

export default CustomExpandableCalendar;
