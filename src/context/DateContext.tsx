import React, { createContext, useContext, useState } from "react";
import { DateTime } from "luxon";

type DateContextType = {
  selectedDate: DateTime | null;
  setSelectedDate: (date: DateTime) => void;
};

const DateContext = createContext<DateContextType | null>(null);

export const DateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(
    DateTime.now()
  );

  return (
    <DateContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </DateContext.Provider>
  );
};

export const useDate = (): DateContextType => {
  const context = useContext(DateContext);
  if (!context) throw new Error("useDate must be used within a DateProvider");
  return context;
};
