import { useEffect, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { format } from "date-fns";

import { CustomButton, CustomCard, CustomScreen, CustomText } from "@/components/common";
import { useMeasurements } from "@/features/measurements/hooks/useMeasurements";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { spacing, useThemeColors } from "@/theme";

export default function ProfileScreen() {
  const colors = useThemeColors();
  const { appSettings, updateAppSettings } = useAppSettings();
  const { profile, saveProfile, isSaving } = useProfile();
  const { latest: latestWeight, history: weightHistory, addMeasurement: addWeight } = useMeasurements("weight");
  const { latest: latestHeight, history: heightHistory, addMeasurement: addHeight } = useMeasurements("height");
  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [weightValue, setWeightValue] = useState("");
  const [heightValue, setHeightValue] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName);
    setDateOfBirth(profile.dateOfBirth ? new Date(profile.dateOfBirth) : null);
  }, [profile]);

  const onSaveProfile = async () => {
    if (!displayName.trim()) return;
    await saveProfile({
      displayName: displayName.trim(),
      dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
    });
  };

  const onChangeDob = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === "dismissed") {
      setShowDobPicker(false);
      return;
    }
    if (!selected) return;
    setDateOfBirth(selected);
    setShowDobPicker(false);
  };

  const onAddWeight = async () => {
    const value = Number(weightValue.trim());
    if (!Number.isFinite(value) || value <= 0) return;
    await addWeight({ value, unit: appSettings?.weightUnit ?? "kg" });
    setWeightValue("");
  };

  const onAddHeight = async () => {
    if (appSettings?.heightUnit === "in") {
      const feet = Number(heightFeet.trim() || "0");
      const inches = Number(heightInches.trim() || "0");
      if (!Number.isFinite(feet) || !Number.isFinite(inches)) return;
      if (feet < 0 || inches < 0) return;
      const totalInches = feet * 12 + inches;
      if (totalInches <= 0) return;
      await addHeight({ value: totalInches, unit: "in" });
      setHeightFeet("");
      setHeightInches("");
      return;
    }

    const value = Number(heightValue.trim());
    if (!Number.isFinite(value) || value <= 0) return;
    await addHeight({ value, unit: appSettings?.heightUnit ?? "cm" });
    setHeightValue("");
  };

  const onSwitchUnitSystem = async (system: "metric" | "imperial") => {
    if (system === "metric") {
      await updateAppSettings({ weightUnit: "kg", heightUnit: "cm", distanceUnit: "km" });
      return;
    }
    await updateAppSettings({ weightUnit: "lb", heightUnit: "in", distanceUnit: "mi" });
  };

  return (
    <CustomScreen scroll>
      <CustomText variant="title">Profile</CustomText>
      <CustomText muted style={styles.subtitle}>
        Profile + weight/height tracking.
      </CustomText>
      <View style={styles.gap}>
        <CustomCard style={styles.card}>
          <CustomText>Profile</CustomText>
          <CustomText muted>Unit System</CustomText>
          <View style={styles.row}>
            <Pressable
              onPress={() => void onSwitchUnitSystem("metric")}
              style={[
                styles.segment,
                appSettings?.heightUnit === "cm"
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <CustomText
                muted={appSettings?.heightUnit !== "cm"}
                style={appSettings?.heightUnit === "cm" ? { color: colors.primaryText } : undefined}
              >
                Metric
              </CustomText>
            </Pressable>
            <Pressable
              onPress={() => void onSwitchUnitSystem("imperial")}
              style={[
                styles.segment,
                appSettings?.heightUnit === "in"
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <CustomText
                muted={appSettings?.heightUnit !== "in"}
                style={appSettings?.heightUnit === "in" ? { color: colors.primaryText } : undefined}
              >
                Imperial
              </CustomText>
            </Pressable>
          </View>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Display name"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
          />
          <CustomButton
            label={dateOfBirth ? `DOB ${format(dateOfBirth, "PPP")}` : "Set Date of Birth (optional)"}
            onPress={() => setShowDobPicker(true)}
          />
          {showDobPicker ? (
            <DateTimePicker
              mode="date"
              value={dateOfBirth ?? new Date(2000, 0, 1)}
              onChange={onChangeDob}
            />
          ) : null}
          <CustomButton label="Save Profile" loading={isSaving} onPress={() => void onSaveProfile()} />
        </CustomCard>

        <CustomCard style={styles.card}>
          <CustomText>Weight</CustomText>
          <CustomText muted>{`Latest ${latestWeight ? `${latestWeight.value} ${latestWeight.unit}` : "N/A"}`}</CustomText>
          <View style={styles.row}>
            <TextInput
              value={weightValue}
              onChangeText={setWeightValue}
              placeholder={`Weight (${appSettings?.weightUnit ?? "kg"})`}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, styles.flex, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
            />
            <CustomButton label="Add" onPress={() => void onAddWeight()} />
          </View>
          {weightHistory.slice(-5).reverse().map((item) => (
            <CustomText key={item.id} muted>{`${format(new Date(item.measuredAt), "PP")} • ${item.value} ${item.unit}`}</CustomText>
          ))}
        </CustomCard>

        <CustomCard style={styles.card}>
          <CustomText>Height</CustomText>
          <CustomText muted>
            {`Latest ${
              latestHeight
                ? latestHeight.unit === "in"
                  ? `${Math.floor(latestHeight.value / 12)} ft ${latestHeight.value % 12} in`
                  : `${latestHeight.value} ${latestHeight.unit}`
                : "N/A"
            }`}
          </CustomText>
          <View style={styles.row}>
            {appSettings?.heightUnit === "in" ? (
              <>
                <TextInput
                  value={heightFeet}
                  onChangeText={setHeightFeet}
                  placeholder="Feet"
                  keyboardType="number-pad"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, styles.flex, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                />
                <TextInput
                  value={heightInches}
                  onChangeText={setHeightInches}
                  placeholder="Inches"
                  keyboardType="number-pad"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, styles.flex, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                />
              </>
            ) : (
              <TextInput
                value={heightValue}
                onChangeText={setHeightValue}
                placeholder="Height"
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.flex, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              />
            )}
            <CustomButton label="Add" onPress={() => void onAddHeight()} />
          </View>
          {heightHistory.slice(-5).reverse().map((item) => (
            <CustomText key={item.id} muted>
              {`${format(new Date(item.measuredAt), "PP")} • ${
                item.unit === "in"
                  ? `${Math.floor(item.value / 12)} ft ${item.value % 12} in`
                  : `${item.value} ${item.unit}`
              }`}
            </CustomText>
          ))}
        </CustomCard>
      </View>
    </CustomScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: spacing.xs },
  gap: { marginTop: spacing.lg, gap: spacing.md },
  card: { gap: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  flex: { flex: 1 },
  segment: {
    flex: 1,
    borderWidth: 1,
    borderRadius: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
});
