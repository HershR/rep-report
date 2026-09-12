import { useRouter, type Href } from "expo-router";
import { Calculator, ChevronRight, Plus, Settings } from "lucide-react-native";
import { View } from "react-native";

import { CustomScreen } from "@/components/common";
import { Button } from "@/components/ui/button";
import { FadeInView } from "@/components/ui/fade-in-view";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useWorkoutTemplates } from "@/features/templates/hooks/useWorkoutTemplates";
import { WeeklyProgressCard } from "@/features/workouts/components/WeeklyProgressCard";
import { useActiveWorkout } from "@/features/workouts/hooks/useActiveWorkout";

const WEEKDAY_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "long",
  month: "short",
  day: "numeric",
};

export default function HomeScreen() {
  const router = useRouter();
  const { templates, isLoading: templatesLoading } = useWorkoutTemplates();
  const { activeWorkout } = useActiveWorkout();
  const { profile } = useProfile();

  const today = new Date()
    .toLocaleDateString(undefined, WEEKDAY_FORMAT)
    .toUpperCase();

  return (
    <CustomScreen scroll contentContainerStyle={{ paddingBottom: 24 }}>
      <View className="flex-row items-center justify-between pb-4">
        <View className="gap-1">
          <Text variant="sectionLabel">{today}</Text>
          <Text className="text-[21px] font-bold tracking-tight">
            {profile ? `Hi ${profile.displayName}` : "Today"}
          </Text>
        </View>
        <Button
          variant="ghost"
          size="icon"
          className="-mr-2 size-11"
          accessibilityLabel="Settings"
          onPress={() => router.push("/settings" as Href)}
        >
          <Icon as={Settings} className="text-text-3 size-5" />
        </Button>
      </View>

      <WeeklyProgressCard />

      {activeWorkout?.status === "active" ? (
        <FadeInView>
          <View className="border-primary/30 bg-card mt-3 flex-row items-center gap-3 rounded-lg border p-3.5">
            <View className="bg-primary size-2 rounded-full" />
            <View className="flex-1 gap-1">
              <Text variant="microLabel" className="text-primary">
                IN PROGRESS
              </Text>
              <Text variant="itemTitle" numberOfLines={1}>
                {activeWorkout.name}
              </Text>
            </View>
            <Button
              className="bg-primary/10 h-11"
              onPress={() =>
                router.push({
                  pathname: "/workout/active",
                  params: { sessionId: activeWorkout.id },
                })
              }
            >
              <Text className="text-primary">Resume</Text>
            </Button>
          </View>
        </FadeInView>
      ) : null}

      <Button
        size="lg"
        className="mt-3.5 h-14"
        onPress={() =>
          router.push({
            pathname: "/workout/active",
            params: { name: "Workout" },
          })
        }
      >
        <Icon as={Plus} className="text-primary-foreground size-5" />
        <Text className="text-[16px]">Start empty workout</Text>
      </Button>

      <View className="mt-5">
        <View className="h-6 flex-row items-center justify-between">
          <Text variant="sectionLabel">TEMPLATES</Text>
          {templates.length > 0 ? (
            <Button
              variant="ghost"
              className="-mr-2.5 h-6 px-2.5"
              onPress={() => router.push("/saved" as Href)}
            >
              <Text className="text-text-3 text-xs font-semibold">See all</Text>
            </Button>
          ) : null}
        </View>

        {templatesLoading ? (
          <View className="mt-2.5 gap-2">
            <Skeleton className="h-[58px] w-full rounded-lg" />
            <Skeleton className="h-[58px] w-full rounded-lg" />
          </View>
        ) : templates.length === 0 ? (
          <FadeInView>
            <Text className="text-text-3 mt-2.5 text-sm">
              No templates yet. Create one in the Saved tab.
            </Text>
          </FadeInView>
        ) : (
          <FadeInView>
            <View className="mt-2.5 gap-2">
              {templates.slice(0, 3).map((template, index) => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="border-border bg-card h-[58px] flex-row justify-start gap-3 px-3.5"
                  onPress={() =>
                    router.push({
                      pathname: "/workout/active",
                      params: { templateId: template.id, name: template.name },
                    })
                  }
                >
                  <View className="bg-surface-raised size-9 items-center justify-center rounded-md">
                    <Text variant="meta" className="text-text-2">
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text variant="itemTitle" numberOfLines={1} className="flex-1">
                    {template.name}
                  </Text>
                  <Icon as={ChevronRight} className="text-text-4 size-4" />
                </Button>
              ))}
            </View>
          </FadeInView>
        )}
      </View>

      {/* One utility row; it does not warrant a section header of its own. */}
      <Button
        variant="outline"
        className="border-border bg-surface-inset mt-3.5 h-12 flex-row justify-start gap-3 px-3.5"
        onPress={() => router.push("/tools/plate-calculator" as Href)}
      >
        <Icon as={Calculator} className="text-text-3 size-[18px]" />
        <Text className="flex-1 text-sm font-medium">Plate calculator</Text>
        <Icon as={ChevronRight} className="text-text-4 size-4" />
      </Button>
    </CustomScreen>
  );
}
