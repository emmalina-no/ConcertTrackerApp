import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ui/themed-text";
import { BorderWidth, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export function Chip({
  label,
  selected = false,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  const theme = useTheme();

  const body = (
    <View
      style={[
        styles.chip,
        { borderColor: theme.accentWarm },
        selected
          ? { backgroundColor: theme.accentWarm }
          : { backgroundColor: theme.backgroundElement },
      ]}
    >
      <ThemedText
        type="small"
        style={{ color: selected ? theme.onAccent : theme.accentWarm }}
      >
        {label}
      </ThemedText>
    </View>
  );

  if (!onPress) return body;

  return (
    <Pressable onPress={onPress} accessibilityState={{ selected }}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: Radius.md,
    borderWidth: BorderWidth.thin,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
});
