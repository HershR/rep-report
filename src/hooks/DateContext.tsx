import { localDayToUtcISO, nowUtcISO, utcISOToLocalDay } from '@/lib/dateUtils';
import { DateContextType } from '@/types/DateContextTypes';
import React, { createContext, ReactNode, useCallback, useMemo, useState } from 'react';

export const DateContext = createContext<DateContextType | null>(null);

interface DateProviderProps {
  children: ReactNode;
}
export const DateProvider = ({ children }: DateProviderProps) => {
  const [currentDate, setCurrentDate] = useState(nowUtcISO());

  const currentLocalDate = useMemo(() => utcISOToLocalDay(currentDate), [currentDate]);

  const updateDate = useCallback((newDate: string) => {
    setCurrentDate(newDate);
  }, []);

  const updateLocalDate = useCallback((localDate: string) => {
    const utcISO = localDayToUtcISO(localDate);
    setCurrentDate(utcISO);
  }, []);

  const value = {
    currentDate,
    updateDate,
    currentLocalDate,
    updateLocalDate,
  };

  return <DateContext.Provider value={value}>{children}</DateContext.Provider>;
};
