import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import * as Haptics from "expo-haptics";
import { Check, Dumbbell, Trash2 } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { PlateCalculatorSheet } from "@/features/plate-calculator/components/PlateCalculatorSheet";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import type { WorkoutSessionSet } from "@/features/workouts/types";
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

  const reducedMotion = useReducedMotion();
  const completeButtonScale = useSharedValue(1);
  const wasCompletedRef = useRef(isCompleted);

  useEffect(() => {
    // Pop only on the incomplete → complete transition, never on mount or when un-marking.
    if (isCompleted && !wasCompletedRef.current) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (!reducedMotion) {
        completeButtonScale.value = withSequence(
          withTiming(1.06, { duration: 80 }),
          withTiming(1, { duration: 100 }),
        );
      }
    }
    wasCompletedRef.current = isCompleted;
  }, [isCompleted, reducedMotion, completeButtonScale]);

  const completeButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: completeButtonScale.value }],
  }));

  const [durationInput, setDurationInput] = useState("");
  const [isDurationFocused, setIsDurationFocused] = useState(false);
  const [distanceInput, setDistanceInput] = useState("");
  const [isDistanceFocused, setIsDistanceFocused] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [isWeightFocused, setIsWeightFocused] = useState(false);
  const [plateCalcOpen, setPlateCalcOpen] = useState(false);

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
    <View
      className={cn(
        "flex-row items-center gap-2 rounded-md px-2 py-1.5",
        isCompleted && "bg-primary/10",
      )}
    >
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
            onFocus={() => setIsDurationFocused(true)}
            onEndEditing={commitDuration}
            onBlur={commitDuration}
            onSubmitEditing={commitDuration}
          />
          <Input
            className="h-9 flex-1 px-2 text-center"
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
            defaultValue={toText(workoutSet.reps)}
            keyboardType="number-pad"
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
            className="h-9 flex-1 px-2 text-center"
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
            onFocus={() => setIsWeightFocused(true)}
            onEndEditing={commitWeight}
            onBlur={commitWeight}
            onSubmitEditing={commitWeight}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-7"
            onPress={() => setPlateCalcOpen(true)}
          >
            <Icon as={Dumbbell} className="text-muted-foreground size-3.5" />
          </Button>
        </>
      )}

      <Animated.View style={completeButtonAnimatedStyle}>
        <Button
          variant={isCompleted ? "default" : "outline"}
          size="icon"
          className="h-9 w-9"
          onPress={() => onUpdate(workoutSet.id, { isCompleted: !isCompleted })}
        >
          <Icon
            as={Check}
            className={cn(
              "size-4",
              isCompleted ? "text-primary-foreground" : "text-muted-foreground",
            )}
          />
        </Button>
      </Animated.View>

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-8"
        onPress={() => onDelete(workoutSet.id)}
      >
        <Icon as={Trash2} className="text-muted-foreground size-3.5" />
      </Button>

      <PlateCalculatorSheet
        visible={plateCalcOpen}
        onClose={() => setPlateCalcOpen(false)}
        targetWeight={toNumber(weightInput)}
        weightUnit={weightUnit}
      />
    </View>
  );
}
