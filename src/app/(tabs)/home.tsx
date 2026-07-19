import { useRouter } from "expo-router";
import { View } from "react-native";

import { CustomScreen } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FadeInView } from "@/components/ui/fade-in-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useWorkoutTemplates } from "@/features/templates/hooks/useWorkoutTemplates";
import { useActiveWorkout } from "@/features/workouts/hooks/useActiveWorkout";

export default function HomeScreen() {
  const router = useRouter();
  const { templates, isLoading: templatesLoading } = useWorkoutTemplates();
  const { activeWorkout } = useActiveWorkout();
  const { profile } = useProfile();

  return (
    <CustomScreen scroll>
      <Text variant="h2">
        {profile ? `Hi ${profile.displayName}!` : "Home"}
      </Text>
      <Text variant="muted">Ready to train?</Text>

      <View className="mt-6 gap-4">
        <Card>
          <CardContent className="gap-3">
            <Text variant="muted">Every set counts.</Text>

            <Button
              onPress={() =>
                router.push({
                  pathname: "/workout/active",
                  params: { name: "Workout" },
                })
              }
            >
              <Text>Start Workout</Text>
            </Button>

            {activeWorkout?.status === "active" ? (
              <Button
                variant="secondary"
                onPress={() =>
                  router.push({
                    pathname: "/workout/active",
                    params: { sessionId: activeWorkout.id },
                  })
                }
              >
                <Text>Resume Workout</Text>
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <View className="gap-2">
          <Text variant="large">Start From Template</Text>
          {templatesLoading ? (
            <View className="gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </View>
          ) : templates.length === 0 ? (
            <FadeInView>
              <Text variant="muted">
                No templates yet. Create one in the Saved tab.
              </Text>
            </FadeInView>
          ) : (
            <FadeInView>
              <View className="gap-2">
                {templates.slice(0, 3).map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    onPress={() =>
                      router.push({
                        pathname: "/workout/active",
                        params: {
                          templateId: template.id,
                          name: template.name,
                        },
                      })
                    }
                  >
                    <Text>{template.name}</Text>
                  </Button>
                ))}
              </View>
            </FadeInView>
          )}
        </View>
      </View>
    </CustomScreen>
  );
}
