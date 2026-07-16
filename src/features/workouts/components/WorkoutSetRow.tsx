import { useEffect, useState } from "react";
import { View } from "react-native";
import { Trash2 } from "lucide-react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import type { WorkoutSessionSet } from "@/features/workouts/types";
import {
  durationDisplayToSeconds,
  formatDurationInput,
  secondsToDurationDisplay,
} from "@/features/workouts/utils/durationInput";
import { distanceToText, textToMetricDistance, weightToText, textToMetricWeight } from "@/lib/units";

type WorkoutSetRowProps = {
  index: number;
  workoutSet: WorkoutSessionSet;
  isCardio: boolean;
  commitOnChange?: boolean;
  onUpdate: (
    setId: string,
    input: {
      reps?: number | null;
      weight?: number | null;
      durationSeconds?: number | null;
      distance?: number | null;
      isCompleted?: boolean;
    },
  ) => void;
  onDelete: (setId: string) => void;
};

function toText(value: number | null): string {
  return value === null ? "" : String(value);
}

function toNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function WorkoutSetRow({
  index,
  workoutSet,
  isCardio,
  commitOnChange = false,
  onUpdate,
  onDelete,
}: WorkoutSetRowProps) {
  const { appSettings } = useAppSettings();
  const distanceUnit = appSettings?.distanceUnit ?? "mi";
  const weightUnit = appSettings?.weightUnit ?? "lb";
  const isCompleted = workoutSet.isCompleted === 1;

  const [durationInput, setDurationInput] = useState("");
  const [isDurationFocused, setIsDurationFocused] = useState(false);
  const [distanceInput, setDistanceInput] = useState("");
  const [isDistanceFocused, setIsDistanceFocused] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [isWeightFocused, setIsWeightFocused] = useState(false);

  useEffect(() => {
    if (isDurationFocused) return;
    setDurationInput(secondsToDurationDisplay(workoutSet.durationSeconds));
  }, [workoutSet.durationSeconds, workoutSet.id, isDurationFocused]);

  useEffect(() => {
    if (isDistanceFocused) return;
    setDistanceInput(distanceToText(workoutSet.distance, distanceUnit));
  }, [workoutSet.distance, workoutSet.id, distanceUnit, isDistanceFocused]);

  useEffect(() => {
    if (isWeightFocused) return;
    setWeightInput(weightToText(workoutSet.weight, weightUnit));
  }, [workoutSet.weight, workoutSet.id, weightUnit, isWeightFocused]);

  const commitDuration = () => {
    setIsDurationFocused(false);
    onUpdate(workoutSet.id, {
      durationSeconds: durationDisplayToSeconds(durationInput),
    });
  };

  const commitDistance = () => {
    setIsDistanceFocused(false);
    onUpdate(workoutSet.id, {
      distance: textToMetricDistance(distanceInput, distanceUnit),
    });
  };

  const commitWeight = () => {
    setIsWeightFocused(false);
    onUpdate(workoutSet.id, {
      weight: textToMetricWeight(weightInput, weightUnit),
    });
  };

  return (
    <View className="bg-muted gap-2 rounded-md p-3">
      <View className="flex-row items-center justify-between">
        <Text variant="muted">{`Set ${index + 1}`}</Text>
        <View className="flex-row items-center gap-2">
          <Button
            variant={isCompleted ? "default" : "outline"}
            size="sm"
            onPress={() => onUpdate(workoutSet.id, { isCompleted: !isCompleted })}
          >
            <Text>{isCompleted ? "Done" : "Mark"}</Text>
          </Button>
          <Button variant="ghost" size="icon" onPress={() => onDelete(workoutSet.id)}>
            <Icon as={Trash2} className="text-muted-foreground size-4" />
          </Button>
        </View>
      </View>

      <View className="flex-row gap-2">
        {isCardio ? (
          <>
            <Input
              className="flex-1"
              value={durationInput}
              onChangeText={(value) => {
                const formatted = formatDurationInput(value);
                setDurationInput(formatted);
                if (commitOnChange) {
                  onUpdate(workoutSet.id, {
                    durationSeconds: durationDisplayToSeconds(formatted),
                  });
                }
              }}
              keyboardType="number-pad"
              placeholder="hh:mm:ss"
              onFocus={() => setIsDurationFocused(true)}
              onEndEditing={commitDuration}
              onBlur={commitDuration}
              onSubmitEditing={commitDuration}
            />
            <Input
              className="flex-1"
              value={distanceInput}
              onChangeText={(value) => {
                setDistanceInput(value);
                if (commitOnChange) {
                  onUpdate(workoutSet.id, {
                    distance: textToMetricDistance(value, distanceUnit),
                  });
                }
              }}
              keyboardType="decimal-pad"
              placeholder={`Dist (${distanceUnit})`}
              onFocus={() => setIsDistanceFocused(true)}
              onEndEditing={commitDistance}
              onBlur={commitDistance}
              onSubmitEditing={commitDistance}
            />
          </>
        ) : (
          <>
            <Input
              className="flex-1"
              defaultValue={toText(workoutSet.reps)}
              keyboardType="number-pad"
              placeholder="Reps"
              onEndEditing={(event) => {
                if (!commitOnChange) {
                  onUpdate(workoutSet.id, {
                    reps: toNumber(event.nativeEvent.text),
                  });
                }
              }}
              onChangeText={
                commitOnChange
                  ? (value) => {
                      onUpdate(workoutSet.id, {
                        reps: toNumber(value),
                      });
                    }
                  : undefined
              }
            />
            <Input
              className="flex-1"
              value={weightInput}
              onChangeText={(value) => {
                setWeightInput(value);
                if (commitOnChange) {
                  onUpdate(workoutSet.id, {
                    weight: textToMetricWeight(value, weightUnit),
                  });
                }
              }}
              keyboardType="decimal-pad"
              placeholder={`Wt (${weightUnit})`}
              onFocus={() => setIsWeightFocused(true)}
              onEndEditing={commitWeight}
              onBlur={commitWeight}
              onSubmitEditing={commitWeight}
            />
          </>
        )}
      </View>
    </View>
  );
}
