import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, LayoutChangeEvent, Modal, Pressable, Text, View } from 'react-native';
import { CalendarProvider, ExpandableCalendar } from 'react-native-calendars';

type Props = {
  initialDateISO?: string;
  onDateSelected?: (dateISO: string) => void;
};

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function yearRange(centerYear: number, span: number) {
  const start = centerYear - span;
  const end = centerYear + span;
  const years: number[] = [];
  for (let y = start; y <= end; y++) years.push(y);
  return years;
}

export function WorkoutHistoryCalendar({ initialDateISO, onDateSelected }: Props) {
  const todayISO = useMemo(() => toISODate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(initialDateISO ?? todayISO);
  const [calendarWidth, setCalendarWidth] = useState<number | null>(null);

  const selected = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    return { y, m, d };
  }, [selectedDate]);

  const [isYearOpen, setIsYearOpen] = useState(false);

  const years = useMemo(() => yearRange(new Date().getFullYear(), 10), []);

  const jumpToYear = useCallback(
    (newYear: number) => {
      const dt = new Date(selected.y, selected.m - 1, selected.d);
      dt.setFullYear(newYear);
      const nextISO = toISODate(dt);
      setSelectedDate(nextISO);
      onDateSelected?.(nextISO);
    },
    [selected, onDateSelected]
  );

  const handleDateChange = useCallback(
    (dateISO: string) => {
      setSelectedDate(dateISO);
      onDateSelected?.(dateISO);
    },
    [onDateSelected]
  );
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    setCalendarWidth(w);
  }, []);
  return (
    <View className="flex-1" onLayout={onLayout}>
      {calendarWidth !== null && (
        <CalendarProvider
          date={selectedDate}
          onDateChanged={handleDateChange}
          onMonthChange={(m) => {
            setSelectedDate(m.dateString);
          }}>
          <ExpandableCalendar
            firstDay={1}
            initialPosition={ExpandableCalendar.positions.CLOSED}
            disableAllTouchEventsForDisabledDays
            hideKnob
            hideArrows
            markedDates={{
              [selectedDate]: { selected: true },
            }}
            theme={{
              todayTextColor: '#111827',
            }}
            style={{ width: calendarWidth ?? undefined }}
          />
        </CalendarProvider>
      )}

      {/* Year Modal */}
      <Modal
        visible={isYearOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsYearOpen(false)}>
        <Pressable
          className="flex-1 justify-center bg-black/40 px-6"
          onPress={() => setIsYearOpen(false)}>
          <View className="max-h-[400px] rounded-2xl bg-white p-4">
            <Text className="mb-3 text-base font-bold">Select year</Text>

            <FlatList
              data={years}
              keyExtractor={(item) => String(item)}
              renderItem={({ item }) => {
                const isSelected = item === selected.y;
                return (
                  <Pressable
                    onPress={() => {
                      setIsYearOpen(false);
                      jumpToYear(item);
                    }}
                    className={`rounded-lg px-3 py-2 ${isSelected ? 'bg-indigo-100' : ''}`}>
                    <Text
                      className={`text-base ${
                        isSelected ? 'font-bold text-indigo-700' : 'text-gray-800'
                      }`}>
                      {item}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
