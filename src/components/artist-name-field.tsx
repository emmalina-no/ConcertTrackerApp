import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Artist } from '@/lib/types';

export function ArtistNameField({
  value,
  onChangeText,
  artists,
}: {
  value: string;
  onChangeText: (name: string) => void;
  artists: Artist[];
}) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const query = value.trim().toLowerCase();
  const matches =
    focused && query.length > 0
      ? artists.filter((a) => a.name.toLowerCase().includes(query) && a.name.toLowerCase() !== query).slice(0, 5)
      : [];

  return (
    <ThemedView>
      <ThemedTextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Artist name"
        style={{ backgroundColor: theme.background }}
      />
      {matches.length > 0 && (
        <ThemedView style={styles.suggestions}>
          {matches.map((artist) => (
            <Pressable
              key={artist.id}
              onPress={() => {
                onChangeText(artist.name);
                setFocused(false);
              }}
              style={styles.suggestionRow}>
              <ThemedText type="small">{artist.name}</ThemedText>
            </Pressable>
          ))}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  suggestions: {
    marginTop: Spacing.half,
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  suggestionRow: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
