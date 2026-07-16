import { Trash2 } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { WorkoutTemplate } from "@/features/templates/types";

type TemplateCardProps = {
  template: WorkoutTemplate;
  onPress: () => void;
  onDelete: () => void;
};

export function TemplateCard({ template, onPress, onDelete }: TemplateCardProps) {
  return (
    <Card className="p-0">
      <View className="flex-row items-start gap-3 p-4">
        <Pressable className="flex-1 gap-1" onPress={onPress}>
          <Text>{template.name}</Text>
          {template.description ? <Text variant="muted">{template.description}</Text> : null}
          <Badge variant="secondary" className="mt-1 self-start">
            <Text>{`${template.exercises.length} exercise${template.exercises.length === 1 ? "" : "s"}`}</Text>
          </Badge>
        </Pressable>
        <Button variant="ghost" size="icon" onPress={onDelete}>
          <Icon as={Trash2} className="text-muted-foreground size-4" />
        </Button>
      </View>
    </Card>
  );
}
