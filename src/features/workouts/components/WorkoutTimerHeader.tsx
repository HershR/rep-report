import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

type WorkoutTimerHeaderProps = {
  workoutName: string;
  elapsedSeconds: number;
};

function formatElapsed(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const remainingSeconds = clamped % 60;
  return [hours, minutes, remainingSeconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export function WorkoutTimerHeader({ workoutName, elapsedSeconds }: WorkoutTimerHeaderProps) {
  return (
    <Card>
      <CardContent className="gap-1">
        <Text variant="h3">{workoutName}</Text>
        <Text variant="muted">{`Elapsed ${formatElapsed(elapsedSeconds)}`}</Text>
      </CardContent>
    </Card>
  );
}
