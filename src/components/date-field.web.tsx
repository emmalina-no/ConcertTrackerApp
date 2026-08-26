import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function DateField({
  value,
  onChange,
  clearable,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  clearable?: boolean;
}) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.row}>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          colorScheme: theme.background === '#000000' ? 'dark' : 'light',
          color: theme.text,
          backgroundColor: theme.backgroundElement,
          border: `1px solid ${theme.backgroundSelected}`,
          borderRadius: Spacing.two,
          padding: `${Spacing.two}px ${Spacing.three}px`,
          fontSize: 16,
          fontFamily: 'inherit',
          flex: 1,
        }}
      />
      {clearable && value.length > 0 && (
        <Pressable onPress={() => onChange('')}>
          <ThemedText type="link">Clear</ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
