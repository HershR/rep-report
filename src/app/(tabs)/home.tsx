import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import {
  CustomButton,
  CustomCard,
  CustomScreen,
  CustomText,
} from "@/components/common";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useWorkoutTemplates } from "@/features/templates/hooks/useWorkoutTemplates";
import { useActiveWorkout } from "@/features/workouts/hooks/useActiveWorkout";
import { spacing } from "@/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { templates } = useWorkoutTemplates();
  const { activeWorkout } = useActiveWorkout();
  const { profile } = useProfile();

  return (
    <CustomScreen scroll>
      <CustomText variant="title">
        {profile ? `Hi ${profile.displayName}!` : "Home"}
      </CustomText>
      <CustomText muted style={styles.subtitle}>
        Ready to train?
      </CustomText>
      <View style={styles.gap}>
        <CustomCard>
          <CustomText variant="caption" muted>
            Every set counts.
          </CustomText>
        </CustomCard>

        <CustomButton
          label="Start Workout"
          onPress={() =>
            router.push({
              pathname: "/workout/active",
              params: { name: "Workout" },
            })
          }
        />

        {activeWorkout?.status === "active" ? (
          <CustomButton
            label="Resume Workout"
            onPress={() =>
              router.push({
                pathname: "/workout/active",
                params: { sessionId: activeWorkout.id },
              })
            }
          />
        ) : null}

        <View style={styles.templateSection}>
          <CustomText>Start From Template</CustomText>
          {templates.length === 0 ? (
            <CustomText muted>No templates yet. Create one in Saved tab.</CustomText>
          ) : (
            templates.slice(0, 3).map((template) => (
              <CustomButton
                key={template.id}
                label={template.name}
                onPress={() =>
                  router.push({
                    pathname: "/workout/active",
                    params: { templateId: template.id, name: template.name },
                  })
                }
              />
            ))
          )}
        </View>
      </View>
    </CustomScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: spacing.xs },
  gap: { marginTop: spacing.lg, gap: spacing.md },
  templateSection: {
    gap: spacing.sm,
  },
});
