import { useFont } from "@shopify/react-native-skia";

/**
 * Axis and value labels in IBM Plex Mono, the face the app's `meta` text uses,
 * so chart numbers match the numbers around them. Skia can't see fonts loaded
 * through expo-font, so it loads the same bundled file itself. Null for the
 * first frame or two while it loads; victory-native draws no labels until then.
 */
export function useChartFont(size = 10) {
  return useFont(
    require("@expo-google-fonts/ibm-plex-mono/500Medium/IBMPlexMono_500Medium.ttf"),
    size,
  );
}
