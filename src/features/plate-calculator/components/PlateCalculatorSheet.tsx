import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { WeightUnit } from "@/db/schema";
import { PlateCalculator } from "@/features/plate-calculator/components/PlateCalculator";

type PlateCalculatorSheetProps = {
  visible: boolean;
  onClose: () => void;
  targetWeight: number | null;
  weightUnit: WeightUnit;
};

export function PlateCalculatorSheet({
  visible,
  onClose,
  targetWeight,
  weightUnit,
}: PlateCalculatorSheetProps) {
  return (
    <Sheet open={visible} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Plate calculator</SheetTitle>
        </SheetHeader>
        <PlateCalculator targetWeight={targetWeight} weightUnit={weightUnit} />
      </SheetContent>
    </Sheet>
  );
}
