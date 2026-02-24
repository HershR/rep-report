import { NAV_THEME } from '@/lib/theme';
import { useTheme } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';
import React, { useCallback, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CalendarProvider, ExpandableCalendar, WeekCalendar } from 'react-native-calendars';
import { Icon } from './ui/icon';
const ITEMS: any[] = [];

interface Props {
  weekView?: boolean;
}
// const CHEVRON = require('../img/next.png');
const ExpandableCalendarScreen = (props: Props) => {
  const { weekView } = props;
  const theme = useTheme();
  const todayBtnTheme = useRef({
    todayButtonTextColor: NAV_THEME[theme.dark ? 'dark' : 'light'].colors.primary,
  });

  // const onDateChanged = useCallback((date, updateSource) => {
  //   console.log('ExpandableCalendarScreen onDateChanged: ', date, updateSource);
  // }, []);

  // const onMonthChange = useCallback(({dateString}) => {
  //   console.log('ExpandableCalendarScreen onMonthChange: ', dateString);
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
        <TouchableOpacity style={styles.header} onPress={toggleCalendarExpansion}>
          <Text style={styles.headerTitle}>{date?.toLocaleDateString()}</Text>
          {/* <Animated.Image
            source={CHEVRON}
            style={{ transform: [{ rotate: '90deg' }, { rotate: rotationInDegrees }] }}
          /> */}
          <Icon
            as={ChevronRight}
            size={24}
            style={{ transform: [{ rotate: rotationInDegrees }] }}
          />
        </TouchableOpacity>
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

  return (
    <CalendarProvider
      date={ITEMS[1]?.title}
      // onDateChanged={onDateChanged}
      // onMonthChange={onMonthChange}
      showTodayButton
      // disabledOpacity={0.6}
      // theme={todayBtnTheme.current}
      // todayBottomMargin={16}
      // disableAutoDaySelection={[ExpandableCalendar.navigationTypes.MONTH_SCROLL, ExpandableCalendar.navigationTypes.MONTH_ARROWS]}
    >
      {weekView ? (
        <WeekCalendar testID={'weekCalendar'} firstDay={1} />
      ) : (
        <ExpandableCalendar
          testID={'calendars'}
          renderHeader={renderHeader}
          ref={calendarRef}
          onCalendarToggled={onCalendarToggled}
          // horizontal={false}
          // hideArrows
          // disablePan
          // hideKnob
          // initialPosition={ExpandableCalendar.positions.OPEN}
          // calendarStyle={styles.calendar}
          // headerStyle={styles.header} // for horizontal only
          // disableWeekScroll
          // theme={theme.current}
          // disableAllTouchEventsForDisabledDays
          firstDay={1}
          // leftArrowImageSource={leftArrowIcon}
          // rightArrowImageSource={rightArrowIcon}
          // animateScroll
          // closeOnDayPress={false}
        />
      )}
    </CalendarProvider>
  );
};

export default ExpandableCalendarScreen;

const styles = StyleSheet.create({
  calendar: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', marginRight: 6 },
  section: {
    backgroundColor: NAV_THEME.light.colors.background,
    color: 'grey',
    textTransform: 'capitalize',
  },
});
