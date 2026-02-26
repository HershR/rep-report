import React, { useCallback, useMemo, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { CalendarProvider, ExpandableCalendar, WeekCalendar } from 'react-native-calendars';
// import { agendaItems, getMarkedDates } from '../mocks/agendaItems';
import { useDate } from '@/hooks/useDate';
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
  const todayISO = useMemo(() => new Date().toISOString().split('T')[0], []);
  // const [selectedDate, setSelectedDate] = useState(initialDateISO ?? todayISO);
  const { currentDate, updateDate } = useDate();
  // const marked = useRef(getMarkedDates());
  const theme = useRef(getTheme());
  const todayBtnTheme = useRef({
    todayButtonTextColor: themeColor,
  });

  // const onDateChanged = useCallback((date, updateSource) => {
  //   console.log('ExpandableCalendarScreen onDateChanged: ', date, updateSource);
  // }, []);

  // const onMonthChange = useCallback(({dateString}) => {
  //   console.log('ExpandableCalendarScreen onMonthChange: ', dateString);
  // }, []);

  // const renderItem = useCallback(({ item }: any) => {
  //   return <AgendaItem item={item} />;
  // }, []);

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
        <Button variant={'ghost'} onPress={toggleCalendarExpansion}>
          <Text className="text-primary text-xl font-semibold">
            {date?.toDateString().split(' ').slice(1, 4).join(' ')}
          </Text>
          <Animated.Image
            source={CHEVRON}
            style={{ transform: [{ rotate: '90deg' }, { rotate: rotationInDegrees }] }}
          />
        </Button>
      );
    },
    [toggleCalendarExpansion]
  );

  const onCalendarToggled = useCallback(
    (isOpen: boolean) => {
      rotation.current.setValue(isOpen ? 1 : 0);
    },
    [rotation]
  );
  const handleDateChange = useCallback(
    (dateISO: string) => {
      updateDate(new Date(dateISO));
    },
    [updateDate]
  );
  return (
    <CalendarProvider
      date={currentDate.toISOString().split('T')[0]}
      onDateChanged={handleDateChange}
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
  );
};

export default CustomExpandableCalendar;
