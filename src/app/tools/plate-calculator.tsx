import { CustomScreen, ScreenHeader } from "@/components/common";
import { PlateCalculator } from "@/features/plate-calculator/components/PlateCalculator";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";

export default function PlateCalculatorScreen() {
  const { appSettings } = useAppSettings();
  const weightUnit = appSettings?.weightUnit ?? "lb";

  return (
    <CustomScreen scroll contentContainerStyle={{ gap: 16 }}>
      <ScreenHeader title="Plate calculator" showBack />
      <PlateCalculator weightUnit={weightUnit} />
    </CustomScreen>
  );
}
