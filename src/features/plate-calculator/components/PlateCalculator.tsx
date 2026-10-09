import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import type { WeightUnit } from "@/db/schema";
import {
  BAR_PRESETS,
  PLATE_SIZES,
  plateColor,
  type BarPreset,
} from "@/features/plate-calculator/constants";
import {
  computePlateLoadout,
  loadedTotalFromCounts,
  type PlateGroup,
} from "@/features/plate-calculator/plateMath";
import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";

type PlateCounts = Record<number, number>;

type PlateCalculatorProps = {
  weightUnit: WeightUnit;
  /** Seed weight in display units. The component remounts per sheet-open, so this seeds initial state. */
  initialWeight?: number | null;
  /** When provided, renders a "Use {total} {unit}" button that applies the loaded total. */
  onApply?: (weight: number) => void;
};

function toNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function trim(value: number): string {
  return String(Number(value.toFixed(2)));
}

function countsFromLoadout(perSide: PlateGroup[]): PlateCounts {
  const counts: PlateCounts = {};
  for (const group of perSide) counts[group.size] = group.count;
  return counts;
}

function toPerSide(counts: PlateCounts, sizes: number[]): PlateGroup[] {
  return sizes
    .filter((size) => (counts[size] ?? 0) > 0)
    .map((size) => ({ size, count: counts[size] }));
}

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
      role="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cn(
        "h-11 justify-center rounded-full border px-4 active:opacity-80",
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

export function PlateCalculator({
  weightUnit,
  initialWeight,
  onApply,
}: PlateCalculatorProps) {
  const colors = THEME;
  const presets = BAR_PRESETS[weightUnit];
  const sizes = PLATE_SIZES[weightUnit];
  const maxSize = sizes[0];
  const defaultBar = presets[0].weight;

  const [barWeight, setBarWeight] = useState(defaultBar);
  const [weightText, setWeightText] = useState(
    initialWeight != null && initialWeight > 0 ? trim(initialWeight) : "",
  );
  const [counts, setCounts] = useState<PlateCounts>(() =>
    initialWeight != null && initialWeight > 0
      ? countsFromLoadout(
          computePlateLoadout(initialWeight, defaultBar, sizes).perSide,
        )
      : {},
  );

  const perSide = toPerSide(counts, sizes);
  const loadedTotal = loadedTotalFromCounts(perSide, barWeight);
  const parsed = toNumber(weightText);
  const belowBar = parsed != null && parsed < barWeight;
  const remainder =
    parsed != null && !belowBar
      ? Number((parsed - loadedTotal).toFixed(2))
      : 0;

  const onChangeWeight = (text: string) => {
    setWeightText(text);
    const value = toNumber(text);
    setCounts(
      value != null && value > 0
        ? countsFromLoadout(computePlateLoadout(value, barWeight, sizes).perSide)
        : {},
    );
  };

  const setCountsAndWeight = (next: PlateCounts) => {
    setCounts(next);
    setWeightText(trim(loadedTotalFromCounts(toPerSide(next, sizes), barWeight)));
  };

  const addPlate = (size: number) => {
    setCountsAndWeight({ ...counts, [size]: (counts[size] ?? 0) + 1 });
  };

  const removePlate = (size: number) => {
    const nextCount = (counts[size] ?? 0) - 1;
    const next = { ...counts };
    if (nextCount > 0) next[size] = nextCount;
    else delete next[size];
    setCountsAndWeight(next);
  };

  const onChangeBar = (weight: number) => {
    setBarWeight(weight);
    setWeightText(trim(loadedTotalFromCounts(perSide, weight)));
  };

  const plateInstances = perSide.flatMap((group) =>
    Array.from({ length: group.count }, () => group.size),
  );
  const breakdownText = perSide
    .map((group) => `${trim(group.size)} × ${group.count}`)
    .join("  ·  ");

  return (
    <View className="gap-4">
      <View className="gap-2">
        <Label>{`Weight (${weightUnit})`}</Label>
        <Input
          value={weightText}
          onChangeText={onChangeWeight}
          placeholder={`Weight (${weightUnit})`}
          keyboardType="decimal-pad"
        />
      </View>

      <View className="gap-2">
        <Text variant="sectionLabel">BAR</Text>
        <View className="flex-row flex-wrap gap-2">
          {presets.map((preset) => (
            <BarChip
              key={preset.label}
              preset={preset}
              unit={weightUnit}
              selected={barWeight === preset.weight}
              onPress={() => onChangeBar(preset.weight)}
            />
          ))}
        </View>
      </View>

      {belowBar ? (
        <Text variant="body" className="text-text-3">
          {`Target is below the bar weight (${trim(barWeight)} ${weightUnit}).`}
        </Text>
      ) : (
        <View className="gap-3">
          <Text variant="sectionLabel">PER SIDE</Text>

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
              <Text variant="body" className="text-text-3 ml-3">
                Just the bar
              </Text>
            ) : (
              plateInstances.map((size, index) => (
                <Pressable
                  key={`${size}-${index}`}
                  role="button"
                  accessibilityLabel={`Remove ${trim(size)} ${weightUnit} plate`}
                  hitSlop={{ top: 8, bottom: 8 }}
                  onPress={() => removePlate(size)}
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
                    // Light on every plate color; the plate palette itself is
                    // the competition standard (constants.ts), not theme tokens.
                    style={{ color: colors.foreground, fontSize: 9, fontWeight: "700" }}
                  >
                    {trim(size)}
                  </Text>
                </Pressable>
              ))
            )}
          </ScrollView>

          {plateInstances.length > 0 ? (
            <Text variant="meta" className="text-text-4">
              TAP A PLATE TO REMOVE IT
            </Text>
          ) : null}
        </View>
      )}

      <View className="gap-2">
        <Text variant="sectionLabel">ADD PLATES · PER SIDE</Text>
        <View className="flex-row flex-wrap gap-2">
          {sizes.map((size) => (
            <Pressable
              key={size}
              role="button"
              accessibilityLabel={`Add ${trim(size)} ${weightUnit} plate`}
              onPress={() => addPlate(size)}
              className="h-11 justify-center rounded-full border px-4 active:opacity-80"
              style={{ borderColor: plateColor(weightUnit, size) }}
            >
              <Text className="text-sm">{`+${trim(size)}`}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {!belowBar ? (
        <View className="gap-0.5">
          {breakdownText ? <Text>{breakdownText}</Text> : null}
          <Text variant="meta" className="text-text-3">
            {`LOADED · ${trim(loadedTotal)} ${weightUnit.toUpperCase()}`}
          </Text>
          {remainder > 0 ? (
            <Text variant="body" className="text-text-3">
              {`~${trim(remainder)} ${weightUnit} can't be loaded with standard plates.`}
            </Text>
          ) : null}
        </View>
      ) : null}

      {onApply ? (
        <Button
          disabled={loadedTotal <= 0}
          onPress={() => onApply(loadedTotal)}
        >
          <Text>{`Use ${trim(loadedTotal)} ${weightUnit}`}</Text>
        </Button>
      ) : null}
    </View>
  );
}
