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
  initialWeight: number | null;
  weightUnit: WeightUnit;
  onApply?: (weight: number) => void;
};

export function PlateCalculatorSheet({
  visible,
  onClose,
  initialWeight,
  weightUnit,
  onApply,
}: PlateCalculatorSheetProps) {
  return (
    <Sheet open={visible} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Plate calculator</SheetTitle>
        </SheetHeader>
        <PlateCalculator
          initialWeight={initialWeight}
          weightUnit={weightUnit}
          onApply={onApply}
        />
      </SheetContent>
    </Sheet>
  );
}
