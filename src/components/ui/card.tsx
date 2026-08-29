import { StyleSheet } from "react-native";

import { ThemedView, type ThemedViewProps } from "@/components/ui/themed-view";
import { BorderWidth, Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export function Card({
  borderColor = "accent",
  style,
  ...rest
}: ThemedViewProps & { borderColor?: ThemeColor }) {
  const theme = useTheme();
  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.card, { borderColor: theme[borderColor] }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.thick,
    padding: Spacing.three,
    gap: Spacing.half,
  },
});
