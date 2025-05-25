import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
}

export function OnboardingProgress({
  currentStep,
  totalSteps,
  onBack,
}: OnboardingProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View className="flex-row items-center p-4 gap-4">
      <TouchableOpacity
        onPress={onBack}
        className="p-2 rounded-md bg-background"
      >
        <Ionicons className="color-primary" name="arrow-back" size={20} />
      </TouchableOpacity>
      <View className="flex-1 h-1 bg-secondary rounded-md overflow-hidden">
        <View
          style={[{ width: `${progress}%` }]}
          className="h-full bg-primary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 120,
    backgroundColor: "#f4f4f4",
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    // backgroundColor: Colors.light.primary,
  },
  stepText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    color: "#666",
  },
});
