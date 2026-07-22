import { ChevronRight } from "lucide-react-native";
import { Pressable } from "react-native";

import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

type MeasurementSummaryCardProps = {
  label: string;
  valueText: string;
  onPress: () => void;
};

export function MeasurementSummaryCard({
  label,
  valueText,
  onPress,
}: MeasurementSummaryCardProps) {
  return (
    <Pressable className="active:opacity-80" onPress={onPress}>
      <Card className="py-0">
        <CardContent className="flex-row items-center gap-3 py-3">
          <Text className="flex-1">{label}</Text>
          <Text variant="muted">{valueText}</Text>
          <Icon as={ChevronRight} className="text-muted-foreground" />
        </CardContent>
      </Card>
    </Pressable>
  );
}
