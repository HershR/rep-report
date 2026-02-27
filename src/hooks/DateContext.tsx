import { DateContextType } from '@/types/DateContextTypes';
import React, { createContext, ReactNode, useEffect, useState } from 'react';

export const DateContext = createContext<DateContextType | null>(null);

interface DateProviderProps {
  children: ReactNode;
}
export const DateProvider = ({ children }: DateProviderProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [localDate, setLocalDate] = useState(new Date());
  const updateDate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  useEffect(() => {
    setLocalDate(new Date(currentDate.getTime() + currentDate.getTimezoneOffset() * 60000));
  }, [currentDate]);

  const value = {
    currentDate,
    updateDate,
    localDate,
  };

  return <DateContext.Provider value={value}>{children}</DateContext.Provider>;
};
