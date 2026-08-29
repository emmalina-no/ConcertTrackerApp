import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ui/themed-view";
import { MaxContentWidth } from "@/constants/theme";

export function Screen({
  children,
  center = false,
  edges = ["bottom"],
}: {
  children: ReactNode;
  /** Centre the content box vertically and horizontally (e.g. the login screen). */
  center?: boolean;
  edges?: readonly Edge[];
}) {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView
        style={[styles.content, center && styles.centered]}
        edges={edges}
      >
        {children}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
  },
  centered: {
    justifyContent: "center",
  },
});
