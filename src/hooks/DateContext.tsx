import { DateContextType } from '@/types/DateContextTypes';
import React, { createContext, ReactNode, useState } from 'react';

export const DateContext = createContext<DateContextType | null>(null);

interface DateProviderProps {
  children: ReactNode;
}
export const DateProvider = ({ children }: DateProviderProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const updateDate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const value = {
    currentDate,
    updateDate,
  };

  return <DateContext.Provider value={value}>{children}</DateContext.Provider>;
};
