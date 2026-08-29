import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ui/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const STARS = [1, 2, 3, 4, 5];

export function StarRating({
  value,
  onChange,
  size = 20,
}: {
  value: number | null;
  onChange?: (value: number | null) => void;
  size?: number;
}) {
  const theme = useTheme();
  const filledColor = theme.accentWarm;
  const emptyColor = theme.textSecondary;
  const editable = !!onChange;

  return (
    <View style={styles.row}>
      {STARS.map((star) => {
        const filled = value != null && star <= value;
        const icon = (
          <Ionicons
            name={filled ? "star" : "star-outline"}
            size={size}
            color={filled ? filledColor : emptyColor}
          />
        );
        if (!editable) return <View key={star}>{icon}</View>;
        return (
          <Pressable
            key={star}
            onPress={() => onChange(star)}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${star} out of 5`}
            hitSlop={Spacing.one}
          >
            {icon}
          </Pressable>
        );
      })}
      {editable && value != null && (
        <Pressable onPress={() => onChange(null)} style={styles.clear}>
          <ThemedText type="link">Clear</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  clear: {
    marginLeft: Spacing.two,
  },
});
