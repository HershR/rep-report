import { useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import { Pressable, ScrollView, View } from "react-native";

import { Text } from "@/components/ui/text";
import type { WeightUnit } from "@/db/schema";
import {
  BAR_PRESETS,
  PLATE_SIZES,
  plateColor,
  type BarPreset,
} from "@/features/plate-calculator/constants";
import { computePlateLoadout } from "@/features/plate-calculator/plateMath";
import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";

type PlateCalculatorProps = {
  /** Target weight in display units (kg or lb). */
  targetWeight: number | null;
  weightUnit: WeightUnit;
};

function BarChip({
  preset,
  selected,
  unit,
  onPress,
}: {
  preset: BarPreset;
  selected: boolean;
  unit: WeightUnit;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "rounded-full border px-3 py-1.5 active:opacity-80",
        selected ? "border-primary bg-primary" : "border-border bg-transparent",
      )}
    >
      <Text
        className={cn(
          "text-sm",
          selected ? "text-primary-foreground" : "text-foreground",
        )}
      >
        {preset.weight > 0 ? `${preset.label} ${preset.weight}${unit}` : preset.label}
      </Text>
    </Pressable>
  );
}

function trim(value: number): string {
  return String(Number(value.toFixed(2)));
}

export function PlateCalculator({
  targetWeight,
  weightUnit,
}: PlateCalculatorProps) {
  const { colorScheme: scheme } = useColorScheme();
  const colors = THEME[scheme ?? "light"];
  const presets = BAR_PRESETS[weightUnit];
  const sizes = PLATE_SIZES[weightUnit];
  const maxSize = sizes[0];

  const [barWeight, setBarWeight] = useState(presets[0].weight);

  // Reset the bar to the unit's default if the unit changes underneath us.
  useEffect(() => {
    setBarWeight(BAR_PRESETS[weightUnit][0].weight);
  }, [weightUnit]);

  const hasTarget = targetWeight !== null && targetWeight > 0;
  const loadout = computePlateLoadout(targetWeight ?? 0, barWeight, sizes);

  const plateInstances = loadout.perSide.flatMap((group) =>
    Array.from({ length: group.count }, () => group.size),
  );

  const breakdownText = loadout.perSide
    .map((group) => `${trim(group.size)} × ${group.count}`)
    .join("  ·  ");

  return (
    <View className="gap-4">
      <View className="gap-2">
        <Text variant="small">Bar</Text>
        <View className="flex-row flex-wrap gap-2">
          {presets.map((preset) => (
            <BarChip
              key={preset.label}
              preset={preset}
              unit={weightUnit}
              selected={barWeight === preset.weight}
              onPress={() => setBarWeight(preset.weight)}
            />
          ))}
        </View>
      </View>

      {!hasTarget ? (
        <Text variant="muted">Enter a weight to see plates.</Text>
      ) : loadout.belowBar ? (
        <Text variant="muted">
          {`Target is below the bar weight (${trim(barWeight)} ${weightUnit}).`}
        </Text>
      ) : (
        <View className="gap-3">
          <Text variant="small" className="text-muted-foreground">
            Per side
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: "center", minHeight: 96 }}
          >
            {/* Bar sleeve stub */}
            <View
              style={{
                width: 28,
                height: 10,
                borderTopRightRadius: 2,
                borderBottomRightRadius: 2,
                backgroundColor: colors.mutedForeground,
              }}
            />
            {plateInstances.length === 0 ? (
              <Text variant="muted" className="ml-3">
                Just the bar
              </Text>
            ) : (
              plateInstances.map((size, index) => (
                <View
                  key={`${size}-${index}`}
                  style={{
                    width: 28,
                    height: 44 + (size / maxSize) * 52,
                    marginLeft: 3,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: plateColor(weightUnit, size),
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 9,
                      fontWeight: "700",
                    }}
                  >
                    {trim(size)}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>

          {breakdownText ? <Text>{breakdownText}</Text> : null}

          <View className="gap-0.5">
            <Text variant="muted" className="text-sm">
              {`Loaded: ${trim(loadout.loadedTotal)} ${weightUnit}`}
            </Text>
            {loadout.remainder > 0 ? (
              <Text variant="muted" className="text-sm">
                {`~${trim(loadout.remainder)} ${weightUnit} can't be loaded with standard plates.`}
              </Text>
            ) : null}
          </View>
        </View>
      )}
    </View>
  );
}
