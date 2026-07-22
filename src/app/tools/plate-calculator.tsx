import { useState } from "react";
import { View } from "react-native";

import { CustomScreen, ScreenHeader } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlateCalculator } from "@/features/plate-calculator/components/PlateCalculator";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";

function toNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function PlateCalculatorScreen() {
  const { appSettings } = useAppSettings();
  const weightUnit = appSettings?.weightUnit ?? "lb";
  const [targetText, setTargetText] = useState("");

  return (
    <CustomScreen scroll contentContainerStyle={{ gap: 16 }}>
      <ScreenHeader title="Plate calculator" />

      <View className="gap-2">
        <Label>{`Target weight (${weightUnit})`}</Label>
        <Input
          value={targetText}
          onChangeText={setTargetText}
          placeholder={`Target weight (${weightUnit})`}
          keyboardType="decimal-pad"
        />
      </View>

      <PlateCalculator targetWeight={toNumber(targetText)} weightUnit={weightUnit} />
    </CustomScreen>
  );
}
