import { useEffect, useState } from "react";
import { View } from "react-native";
import { Trash2 } from "lucide-react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import {
  durationDisplayToSeconds,
  formatDurationInput,
  secondsToDurationDisplay,
} from "@/features/workouts/utils/durationInput";
import {
  distanceToText,
  textToMetricDistance,
  weightToText,
  textToMetricWeight,
} from "@/lib/units";

type TemplateSetRowProps = {
  index: number;
  repsText: string;
  weightText: string;
  durationText: string;
  distanceText: string;
  isCardio: boolean;
  onChangeReps: (value: string) => void;
  onChangeWeight: (value: string) => void;
  onChangeDuration: (value: string) => void;
  onChangeDistance: (value: string) => void;
  onDelete: () => void;
};

export function TemplateSetRow({
  index,
  repsText,
  weightText,
  durationText,
  distanceText,
  isCardio,
  onChangeReps,
  onChangeWeight,
  onChangeDuration,
  onChangeDistance,
  onDelete,
}: TemplateSetRowProps) {
  const { appSettings } = useAppSettings();
  const distanceUnit = appSettings?.distanceUnit ?? "mi";
  const weightUnit = appSettings?.weightUnit ?? "lb";

  const [durationInput, setDurationInput] = useState("");
  const [isDurationFocused, setIsDurationFocused] = useState(false);
  const [distanceInput, setDistanceInput] = useState("");
  const [isDistanceFocused, setIsDistanceFocused] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [isWeightFocused, setIsWeightFocused] = useState(false);

  useEffect(() => {
    if (isDurationFocused) return;
    const secondsValue = Number(durationText || "0");
    setDurationInput(
      secondsToDurationDisplay(
        Number.isFinite(secondsValue) ? secondsValue : 0,
      ),
    );
  }, [durationText, isDurationFocused]);

  useEffect(() => {
    if (isDistanceFocused) return;
    const kmValue = Number(distanceText || "0");
    setDistanceInput(
      distanceToText(
        Number.isFinite(kmValue) && kmValue > 0 ? kmValue : null,
        distanceUnit,
      ),
    );
  }, [distanceText, distanceUnit, isDistanceFocused]);

  useEffect(() => {
    if (isWeightFocused) return;
    const kgValue = Number(weightText || "0");
    setWeightInput(
      weightToText(
        Number.isFinite(kgValue) && kgValue > 0 ? kgValue : null,
        weightUnit,
      ),
    );
  }, [weightText, weightUnit, isWeightFocused]);

  const commitDuration = () => {
    setIsDurationFocused(false);
    onChangeDuration(String(durationDisplayToSeconds(durationInput)));
  };

  const onChangeDurationInput = (value: string) => {
    const formatted = formatDurationInput(value);
    setDurationInput(formatted);
    onChangeDuration(String(durationDisplayToSeconds(formatted)));
  };

  const commitDistance = () => {
    setIsDistanceFocused(false);
    const metricValue = textToMetricDistance(distanceInput, distanceUnit);
    onChangeDistance(metricValue === null ? "" : String(metricValue));
  };

  const onChangeDistanceInput = (value: string) => {
    setDistanceInput(value);
    const metricValue = textToMetricDistance(value, distanceUnit);
    onChangeDistance(metricValue === null ? "" : String(metricValue));
  };

  const commitWeight = () => {
    setIsWeightFocused(false);
    const metricValue = textToMetricWeight(weightInput, weightUnit);
    onChangeWeight(metricValue === null ? "" : String(metricValue));
  };

  const onChangeWeightInput = (value: string) => {
    setWeightInput(value);
    const metricValue = textToMetricWeight(value, weightUnit);
    onChangeWeight(metricValue === null ? "" : String(metricValue));
  };

  return (
    <View className="flex-row items-center gap-2 py-1.5">
      <View className="w-6 items-center">
        <Text variant="muted" className="text-sm">
          {index + 1}
        </Text>
      </View>

      {isCardio ? (
        <>
          <Input
            className="h-9 flex-1 px-2 text-center"
            value={durationInput}
            onChangeText={onChangeDurationInput}
            keyboardType="numeric"
            onFocus={() => setIsDurationFocused(true)}
            onEndEditing={commitDuration}
            onBlur={commitDuration}
            onSubmitEditing={commitDuration}
            placeholder="00:00:00"
          />
          <Input
            className="h-9 flex-1 px-2 text-center"
            value={distanceInput}
            onChangeText={onChangeDistanceInput}
            keyboardType="decimal-pad"
            onFocus={() => setIsDistanceFocused(true)}
            onEndEditing={commitDistance}
            onBlur={commitDistance}
            onSubmitEditing={commitDistance}
          />
        </>
      ) : (
        <>
          <Input
            className="h-9 flex-1 px-2 text-center"
            value={repsText}
            onChangeText={onChangeReps}
            keyboardType="numeric"
          />
          <Input
            className="h-9 flex-1 px-2 text-center"
            value={weightInput}
            onChangeText={onChangeWeightInput}
            keyboardType="decimal-pad"
            onFocus={() => setIsWeightFocused(true)}
            onEndEditing={commitWeight}
            onBlur={commitWeight}
            onSubmitEditing={commitWeight}
          />
        </>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onPress={onDelete}
      >
        <Icon as={Trash2} className="text-muted-foreground size-3.5" />
      </Button>
    </View>
  );
}
