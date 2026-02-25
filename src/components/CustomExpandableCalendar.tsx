import React, { useCallback, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CalendarProvider, ExpandableCalendar, WeekCalendar } from 'react-native-calendars';
// import { agendaItems, getMarkedDates } from '../mocks/agendaItems';
import { getTheme, lightThemeColor, themeColor } from '../lib/calanderTheme';

const leftArrowIcon = require('@/assets/images/previous.png');
const rightArrowIcon = require('@/assets/images/next.png');
// const ITEMS: any[] = agendaItems;

interface Props {
  weekView?: boolean;
}
const CHEVRON = require('@/assets/images/next.png');
const CustomExpandableCalendar = (props: Props) => {
  const { weekView } = props;
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
        <TouchableOpacity style={styles.header} onPress={toggleCalendarExpansion}>
          <Text style={styles.headerTitle}>{date?.toDateString()}</Text>
          <Animated.Image
            source={CHEVRON}
            style={{ transform: [{ rotate: '90deg' }, { rotate: rotationInDegrees }] }}
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
      date={'2024-06-01'}
      // onDateChanged={onDateChanged}
      // onMonthChange={onMonthChange}
      // showTodayButton
      // disabledOpacity={0.6}
      theme={todayBtnTheme.current}
      // todayBottomMargin={16}
      // disableAutoDaySelection={[ExpandableCalendar.navigationTypes.MONTH_SCROLL, ExpandableCalendar.navigationTypes.MONTH_ARROWS]}
    >
      {weekView ? (
        <WeekCalendar
          testID={'CalendarWeek'}
          firstDay={1}
          // markedDates={marked.current}
        />
      ) : (
        <ExpandableCalendar
          testID={'CalendarExpandable'}
          renderHeader={renderHeader}
          ref={calendarRef}
          onCalendarToggled={onCalendarToggled}
          // horizontal={false}
          // hideArrows
          disablePan
          hideKnob
          initialPosition={ExpandableCalendar.positions.OPEN}
          // calendarStyle={styles.calendar}
          // headerStyle={styles.header} // for horizontal only
          // disableWeekScroll
          theme={theme.current}
          // disableAllTouchEventsForDisabledDays
          firstDay={1}
          // markedDates={marked.current}
          leftArrowImageSource={leftArrowIcon}
          rightArrowImageSource={rightArrowIcon}
          animateScroll
          closeOnDayPress
        />
      )}
      {/* <AgendaList
        sections={ITEMS}
        renderItem={renderItem}
        // scrollToNextEvent
        sectionStyle={styles.section}
        // dayFormat={'yyyy-MM-d'}
      /> */}
    </CalendarProvider>
  );
};

export default CustomExpandableCalendar;

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
    backgroundColor: lightThemeColor,
    color: 'grey',
    textTransform: 'capitalize',
  },
});
