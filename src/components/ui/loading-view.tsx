import { ActivityIndicator, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";

/** Full-bleed centered spinner, or a centered message when `message` is set. */
export function LoadingView({ message }: { message?: string | null }) {
  return (
    <ThemedView style={styles.center}>
      {message ? (
        <ThemedText type="default">{message}</ThemedText>
      ) : (
        <ActivityIndicator />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
