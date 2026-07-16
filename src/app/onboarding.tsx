import { useState } from "react";
import { TextInput, View, StyleSheet } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useRouter } from "expo-router";

import {
  CustomButton,
  CustomCard,
  CustomScreen,
  CustomText,
} from "@/components/common";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { spacing, useThemeColors } from "@/theme";

export default function OnboardingScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { saveProfile, isSaving } = useProfile();
  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);

  const onChangeDob = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === "dismissed") {
      setShowDobPicker(false);
      return;
    }
    if (!selected) return;
    setDateOfBirth(selected);
    setShowDobPicker(false);
  };

  const onGetStarted = async () => {
    if (!displayName.trim()) return;
    await saveProfile({
      displayName: displayName.trim(),
      dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
    });
    router.replace("/(tabs)/home");
  };

  return (
    <CustomScreen scroll>
      <CustomText variant="title">Welcome to Rep Report</CustomText>
      <CustomText muted style={styles.subtitle}>
        Track workouts, save favorites, and watch your progress build — one
        set at a time.
      </CustomText>

      <CustomCard style={styles.card}>
        <CustomText>What should we call you?</CustomText>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Display name"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.surface,
            },
          ]}
        />

        <CustomButton
          label={
            dateOfBirth
              ? `DOB ${format(dateOfBirth, "PPP")}`
              : "Set Date of Birth (optional)"
          }
          onPress={() => setShowDobPicker(true)}
        />
        {showDobPicker ? (
          <DateTimePicker
            mode="date"
            value={dateOfBirth ?? new Date(2000, 0, 1)}
            onChange={onChangeDob}
          />
        ) : null}
      </CustomCard>

      <View style={styles.gap}>
        <CustomButton
          label="Let's Go"
          loading={isSaving}
          disabled={!displayName.trim()}
          onPress={() => void onGetStarted()}
        />
      </View>
    </CustomScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: spacing.xs },
  card: { gap: spacing.sm, marginTop: spacing.lg },
  input: {
    borderWidth: 1,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  gap: { marginTop: spacing.lg },
});
