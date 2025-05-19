import React, { createContext, useContext, useState, ReactNode } from "react";

type MeasurementUnit = "metric" | "imperial";

interface MeasurementUnitContextProps {
  unit: MeasurementUnit;
  setUnit: (unit: MeasurementUnit) => void;
  toggleUnit: () => void;
}

const MeasurementUnitContext = createContext<
  MeasurementUnitContextProps | undefined
>(undefined);

export const MeasurementUnitProvider = ({
  defaultUnit = "metric",
  children,
}: {
  defaultUnit?: MeasurementUnit;
  children: ReactNode;
}) => {
  const [unit, setUnit] = useState<MeasurementUnit>(defaultUnit);

  const toggleUnit = () => {
    setUnit((prev) => (prev === "metric" ? "imperial" : "metric"));
  };

  return (
    <MeasurementUnitContext.Provider value={{ unit, setUnit, toggleUnit }}>
      {children}
    </MeasurementUnitContext.Provider>
  );
};

export const useMeasurementUnit = () => {
  const context = useContext(MeasurementUnitContext);
  if (!context) {
    throw new Error(
      "useMeasurementUnit must be used within a MeasurementUnitProvider"
    );
  }
  return context;
};
