import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
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
  toMetricWeight,
} from "@/lib/units";

/** Digits share one advance width, so values line up down the column. */
const TABULAR = { fontVariant: ["tabular-nums" as const] };

type WorkoutSetRowProps = {
  index: number;
  workoutSet: WorkoutSessionSet;
  isCardio: boolean;
  /** First not-yet-completed set in the session - the one you are on. */
  isCurrent?: boolean;
  /** Strength sets open the keypad sheet instead of editing inline. */
  onEditValue?: (setId: string, field: "reps" | "weight") => void;
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
  isCurrent = false,
  onEditValue,
  commitOnChange = false,
  onUpdate,
  onDelete,
}: WorkoutSetRowProps) {
  const { appSettings } = useAppSettings();
  const distanceUnit = appSettings?.distanceUnit ?? "mi";
  const weightUnit = appSettings?.weightUnit ?? "lb";
  const isCompleted = workoutSet.isCompleted === 1;
  const fieldBoxClass = isCompleted
    ? "border-border bg-primary/10"
    : isCurrent
      ? "border-primary bg-surface-raised"
      : "border-border bg-surface-inset";
  const fieldTextClass = isCompleted
    ? "text-value-logged"
    : isCurrent
      ? "text-foreground"
      : "text-value-planned";

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
  const [isWeightFocused] = useState(false);
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

  return (
    <View
      className={cn("h-[52px] flex-row items-center gap-2 rounded-md px-2")}
    >
      <View
        className={cn(
          "size-6 items-center justify-center rounded-full border-2",
          isCompleted
            ? "border-primary bg-primary"
            : isCurrent
              ? "border-primary bg-transparent"
              : "border-border-strong bg-transparent",
        )}
      >
        <Text
          className={cn(
            "font-mono-semibold text-[10px]",
            isCompleted
              ? "text-primary-foreground"
              : isCurrent
                ? "text-primary"
                : "text-text-4",
          )}
        >
          {index + 1}
        </Text>
      </View>

      {isCardio ? (
        <>
          <Input
            className={cn("h-11 flex-1 px-2 text-center font-mono-semibold text-[17px]", fieldBoxClass, fieldTextClass)}
            style={TABULAR}
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
            className={cn("h-11 flex-1 px-2 text-center font-mono-semibold text-[17px]", fieldBoxClass, fieldTextClass)}
            style={TABULAR}
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
          <Pressable
            role="button"
            accessibilityLabel="Edit reps"
            onPress={() => onEditValue?.(workoutSet.id, "reps")}
            className={cn(
              "h-11 flex-1 items-center justify-center rounded-md border px-2",
              fieldBoxClass,
            )}
          >
            <Text
              style={TABULAR}
              className={cn("font-mono-semibold text-[17px]", fieldTextClass)}
            >
              {toText(workoutSet.reps)}
            </Text>
          </Pressable>
          <Pressable
            role="button"
            accessibilityLabel="Edit weight"
            onPress={() => onEditValue?.(workoutSet.id, "weight")}
            className={cn(
              "h-11 flex-1 items-center justify-center rounded-md border px-2",
              fieldBoxClass,
            )}
          >
            <Text
              style={TABULAR}
              className={cn("font-mono-semibold text-[17px]", fieldTextClass)}
            >
              {weightInput}
            </Text>
          </Pressable>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-8"
            onPress={() => setPlateCalcOpen(true)}
          >
            <Icon as={Dumbbell} className="text-text-3 size-4" />
          </Button>
        </>
      )}

      <Animated.View style={completeButtonAnimatedStyle}>
        <Button
          variant={isCompleted ? "default" : "outline"}
          size="icon"
          className={cn("size-11", isCurrent && !isCompleted && "border-primary/40")}
          onPress={() => onUpdate(workoutSet.id, { isCompleted: !isCompleted })}
        >
          <Icon
            as={Check}
            className={cn(
              "size-5",
              isCompleted ? "text-primary-foreground" : isCurrent ? "text-primary/70" : "text-text-4",
            )}
          />
        </Button>
      </Animated.View>

      <Button
        variant="ghost"
        size="icon"
        className="h-11 w-8"
        onPress={() => onDelete(workoutSet.id)}
      >
        <Icon as={Trash2} className="text-text-4 size-4" />
      </Button>

      <PlateCalculatorSheet
        visible={plateCalcOpen}
        onClose={() => setPlateCalcOpen(false)}
        initialWeight={toNumber(weightInput)}
        weightUnit={weightUnit}
        onApply={(displayWeight) => {
          const kg = toMetricWeight(displayWeight, weightUnit);
          setWeightInput(weightToText(kg, weightUnit));
          onUpdate(workoutSet.id, { weight: kg });
          setPlateCalcOpen(false);
        }}
      />
    </View>
  );
}
