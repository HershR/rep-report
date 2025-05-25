import React, { createContext, useContext, useState, ReactNode } from "react";

interface UnitContextProps {
  unit: Unit;
  setUnit: (unit: Unit) => void;
  toggleUnit: () => void;
}

const UnitContext = createContext<UnitContextProps | undefined>(undefined);

export const MeasurementUnitProvider = ({
  defaultUnit = "imperial",
  children,
}: {
  defaultUnit?: Unit;
  children: ReactNode;
}) => {
  const [unit, setUnit] = useState<Unit>(defaultUnit);

  const toggleUnit = () => {
    setUnit((prev) => (prev === "imperial" ? "metric" : "imperial"));
  };

  return (
    <UnitContext.Provider value={{ unit, setUnit, toggleUnit }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useMeasurementUnit = () => {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error("useUnit must be used within a UnitProvider");
  }
  return context;
};
