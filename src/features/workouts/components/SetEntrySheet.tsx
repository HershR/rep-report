import { ChevronLeft, Delete, Dumbbell } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { WeightUnit } from "@/db/schema";
import { PlateCalculator } from "@/features/plate-calculator/components/PlateCalculator";

export type SetEntryField = "reps" | "weight";

export type SetEntryTarget = {
  setId: string;
  exerciseName: string;
  setNumber: number;
  setCount: number;
  field: SetEntryField;
  reps: string;
  weight: string;
  /** Same set from the previous session, if there was one. */
  previous: { reps: string; weight: string } | null;
};

type SetEntrySheetProps = {
  target: SetEntryTarget | null;
  weightUnit: WeightUnit;
  onClose: () => void;
  onCommit: (setId: string, values: { reps: string; weight: string }) => void;
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"];

/** Reps are whole; weight can be fractional. */
function applyKey(current: string, key: string, allowDecimal: boolean): string {
  if (key === "del") return current.slice(0, -1);
  if (key === ".") {
    if (!allowDecimal || current.includes(".")) return current;
    return current === "" ? "0." : current + ".";
  }
  if (current === "0") return key;
  return (current + key).slice(0, 6);
}

function nudge(current: string, delta: number): string {
  const next = (Number(current) || 0) + delta;
  if (next <= 0) return "";
  return String(Math.round(next * 100) / 100);
}

export function SetEntrySheet({
  target,
  weightUnit,
  onClose,
  onCommit,
}: SetEntrySheetProps) {
  const [field, setField] = useState<SetEntryField>("reps");
  const [mode, setMode] = useState<"keypad" | "plates">("keypad");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  // Reseed whenever a different value is opened for editing.
  useEffect(() => {
    if (!target) return;
    setField(target.field);
    setMode("keypad");
    setReps(target.reps);
    setWeight(target.weight);
  }, [target]);

  if (!target) return null;

  const active = field === "reps" ? reps : weight;
  const setActive = (value: string) =>
    field === "reps" ? setReps(value) : setWeight(value);

  const steps = field === "reps" ? [-2, -1, 1, 2] : [-5, -2.5, 2.5, 5];

  return (
    <Sheet open onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <SheetContent>
        <View className="gap-4 pb-2">
          <View className="gap-1">
            <Text variant="microLabel">
              SET {target.setNumber} OF {target.setCount}
            </Text>
            <Text variant="itemTitle">{target.exerciseName}</Text>
          </View>

          {/* Both values stay visible; tapping one moves the keypad to it. */}
          <View className="flex-row gap-2.5">
            {(["reps", "weight"] as const).map((name) => {
              const isActive = field === name;
              const value = name === "reps" ? reps : weight;
              return (
                <Pressable
                  key={name}
                  role="button"
                  accessibilityLabel={name === "reps" ? "Reps" : "Weight"}
                  onPress={() => setField(name)}
                  className={cn(
                    "h-[92px] flex-1 items-center justify-center gap-1 rounded-lg border",
                    isActive
                      ? "border-primary bg-surface-raised"
                      : "border-border bg-surface-inset",
                  )}
                >
                  <Text
                    variant="microLabel"
                    className={cn(isActive && "text-primary")}
                  >
                    {name === "reps"
                      ? "REPS"
                      : `WEIGHT · ${weightUnit.toUpperCase()}`}
                  </Text>
                  <Text
                    variant="numeral"
                    className={cn(
                      "text-[38px]",
                      isActive ? "text-foreground" : "text-value-planned",
                    )}
                  >
                    {value === "" ? "—" : value}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {mode === "plates" ? (
            <View className="gap-3">
              <Pressable
                role="button"
                onPress={() => setMode("keypad")}
                className="-ml-1 h-11 flex-row items-center gap-1.5 self-start pr-3"
              >
                <Icon as={ChevronLeft} className="text-text-2 size-4" />
                <Text variant="meta" className="text-text-2">
                  KEYPAD
                </Text>
              </Pressable>
              <PlateCalculator
                weightUnit={weightUnit}
                initialWeight={Number(weight) || null}
                onApply={(total) => {
                  setWeight(String(total));
                  setMode("keypad");
                }}
              />
            </View>
          ) : (
            <>
          <View className="flex-row gap-2">
            {steps.map((delta) => (
              <Pressable
                key={delta}
                role="button"
                onPress={() => setActive(nudge(active, delta))}
                className="bg-surface-raised h-11 flex-1 items-center justify-center rounded-full"
              >
                <Text variant="meta" className="text-text-2">
                  {delta > 0 ? `+${delta}` : String(delta)}
                </Text>
              </Pressable>
            ))}
            {field === "weight" ? (
              <Pressable
                role="button"
                accessibilityLabel="Plate calculator"
                onPress={() => setMode("plates")}
                className="bg-surface-raised h-11 flex-[1.4] flex-row items-center justify-center gap-1.5 rounded-full"
              >
                <Icon as={Dumbbell} className="text-text-2 size-4" />
                <Text variant="meta" className="text-text-2">
                  PLATES
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              role="button"
              disabled={!target.previous}
              onPress={() => {
                if (!target.previous) return;
                setReps(target.previous.reps);
                setWeight(target.previous.weight);
              }}
              className={cn(
                "bg-surface-raised h-11 flex-[1.4] items-center justify-center rounded-full",
                !target.previous && "opacity-40",
              )}
            >
              <Text variant="meta" className="text-text-2">
                LAST
              </Text>
            </Pressable>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {KEYS.map((key) => (
              <Pressable
                key={key}
                role="button"
                accessibilityLabel={key === "del" ? "Delete" : key}
                onPress={() =>
                  setActive(applyKey(active, key, field === "weight"))
                }
                className={cn(
                  "h-[50px] items-center justify-center rounded-md",
                  key === "." || key === "del"
                    ? "bg-surface-inset"
                    : "bg-surface-raised",
                )}
                style={{ width: "31.8%" }}
              >
                {key === "del" ? (
                  <Icon as={Delete} className="text-text-2 size-6" />
                ) : (
                  <Text variant="numeral" className="text-[21px] font-normal">
                    {key}
                  </Text>
                )}
              </Pressable>
            ))}
          </View>

          <Button
            size="lg"
            onPress={() => onCommit(target.setId, { reps, weight })}
          >
            <Text>Log set · start rest</Text>
          </Button>
            </>
          )}
        </View>
      </SheetContent>
    </Sheet>
  );
}
