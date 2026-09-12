import { Trash2 } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { WorkoutTemplate } from "@/features/templates/types";

type TemplateCardProps = {
  template: WorkoutTemplate;
  /** Letter marker, so templates are distinguishable at a glance. */
  marker?: string;
  onPress: () => void;
  onDelete: () => void;
};

const PREVIEW_COUNT = 2;

export function TemplateCard({
  template,
  marker,
  onPress,
  onDelete,
}: TemplateCardProps) {
  const exercises = template.exercises;
  const setCount = exercises.reduce(
    (total, exercise) => total + exercise.sets.length,
    0,
  );
  const preview = exercises.slice(0, PREVIEW_COUNT);
  const remaining = exercises.length - preview.length;

  return (
    <View className="border-border bg-card rounded-lg border p-3.5">
      <View className="flex-row items-center gap-3">
        {marker ? (
          <View className="bg-surface-raised size-9 items-center justify-center rounded-md">
            <Text variant="meta" className="text-text-2">
              {marker}
            </Text>
          </View>
        ) : null}
        <Pressable className="flex-1 gap-1 active:opacity-80" onPress={onPress}>
          <Text variant="itemTitle" className="text-[16px]" numberOfLines={1}>
            {template.name}
          </Text>
          <Text variant="microLabel">
            {`${exercises.length} EX · ${setCount} SET${setCount === 1 ? "" : "S"}`}
          </Text>
        </Pressable>
        <Button
          variant="ghost"
          size="icon"
          className="-mr-1.5 size-11"
          accessibilityLabel={`Delete ${template.name}`}
          onPress={onDelete}
        >
          <Icon as={Trash2} className="text-text-3 size-[18px]" />
        </Button>
      </View>

      {/* A name and a count do not say what the session is - the first few
          exercises do. */}
      {preview.length > 0 ? (
        <>
          <View className="bg-border my-2.5 h-px" />
          <View className="gap-2">
            {preview.map((item, index) => (
              <View key={item.id} className="flex-row items-baseline gap-2.5">
                <Text variant="meta" className="text-text-4 w-4 text-[10px]">
                  {String(index + 1).padStart(2, "0")}
                </Text>
                <Text
                  className="text-text-2 flex-1 text-[13px]"
                  numberOfLines={1}
                >
                  {item.exercise.name}
                </Text>
                {item.sets.length > 0 ? (
                  <Text variant="meta" className="text-text-3">
                    {item.sets[0]?.targetReps
                      ? `${item.sets.length} × ${item.sets[0].targetReps}`
                      : `${item.sets.length} SET${item.sets.length === 1 ? "" : "S"}`}
                  </Text>
                ) : null}
              </View>
            ))}
            {remaining > 0 ? (
              <View className="flex-row items-baseline gap-2.5">
                <Text variant="meta" className="text-text-4 w-4 text-[10px]">
                  +
                </Text>
                <Text className="text-text-3 flex-1 text-[13px]">
                  {`${remaining} more exercise${remaining === 1 ? "" : "s"}`}
                </Text>
              </View>
            ) : null}
          </View>
        </>
      ) : null}
    </View>
  );
}
