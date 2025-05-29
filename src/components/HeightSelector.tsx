import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Text } from "./ui/text";
import { Input } from "./ui/input";
type UpdateHeightProps = {
  heightCm: number;
  unit: Unit;
  onChange?: (heightCm: number) => void;
};

function cmToFeetInches(cm: number) {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  let inches = totalInches % 12;
  if (!Number.isInteger(inches)) {
    inches = parseFloat(inches.toFixed(1));
  }
  return { feet, inches };
}

function feetInchesToCm(feet: number, inches: number) {
  return Math.round((feet * 12 + inches) * 2.54);
}

export const HeightSelector = ({
  heightCm,
  unit: mode,
  onChange,
}: UpdateHeightProps) => {
  const [cm, setCm] = useState<string | null>(null);
  const [feet, setFeet] = useState<string | null>(null);
  const [inches, setInches] = useState<string | null>(null);
  const cmRegex = /^\d{0,4}(\.\d?)?$/;
  const inchRegex = /^\d{0,3}(\.\d?)?$/;
  useEffect(() => {
    if (mode === "imperial") {
      const { feet, inches } = cmToFeetInches(heightCm);
      setFeet(Number.isInteger(feet) ? feet.toString() : feet.toFixed(1));
      setInches(
        Number.isInteger(inches) ? inches.toString() : inches.toFixed(1)
      );
    } else {
      setCm(
        Number.isInteger(heightCm) ? heightCm.toString() : heightCm.toFixed(1)
      );
    }
  }, [mode]);

  const handleFeetChange = (text: string) => {
    if (text === "") {
      setFeet(null);
    } else {
      setFeet(text);
    }
    const newFeet = parseInt(text);
    const newCm = feetInchesToCm(
      isNaN(newFeet) ? 0 : newFeet,
      inches ? parseFloat(inches) : 0
    );
    onChange?.(newCm);
  };

  const handleInchesChange = (text: string) => {
    if (!inchRegex.test(text)) return;

    let newInches = parseFloat(text);
    if (isNaN(newInches)) {
      setInches(null);
    } else {
      if (newInches > 11.9) {
        newInches = newInches / 10;
        setInches(newInches.toFixed(1));
      } else {
        setInches(text);
      }
    }

    const newCm = feetInchesToCm(
      feet ? parseInt(feet) : 0,
      isNaN(newInches) ? 0 : newInches
    );
    onChange?.(newCm);
  };

  const handleCmChange = (text: string) => {
    if (text === "") {
      setCm(null);
      setInches(null);
      setFeet(null);
      onChange?.(0);
      return;
    }
    if (!cmRegex.test(text)) return;
    let newCm = parseFloat(text);
    if (newCm > 999.9) {
      newCm = newCm / 10;
      setCm(newCm.toFixed(1));
    } else {
      setCm(text);
    }
    onChange?.(newCm);
  };

  return (
    <View className="w-full justify-center items-center">
      {mode === "imperial" ? (
        <View className="flex-row gap-x-4">
          <View className="flex-1">
            <Text>Feet:</Text>
            <Input
              keyboardType="number-pad"
              value={feet || ""}
              onChangeText={handleFeetChange}
              maxLength={1}
            />
          </View>
          <View className="flex-1">
            <Text>Inches:</Text>
            <Input
              keyboardType="number-pad"
              value={inches || ""}
              onChangeText={handleInchesChange}
              maxLength={3}
            />
          </View>
        </View>
      ) : (
        <View className="w-full">
          <Text>Height (cm):</Text>
          <Input
            className="min-w-[50%]"
            keyboardType="number-pad"
            value={cm || ""}
            onChangeText={handleCmChange}
            maxLength={5}
          />
        </View>
      )}
    </View>
  );
};

export default HeightSelector;
