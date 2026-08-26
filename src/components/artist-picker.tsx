import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Artist } from '@/lib/types';

export function ArtistPicker({
  value,
  onChange,
  artists,
}: {
  value: string;
  onChange: (name: string) => void;
  artists: Artist[];
}) {
  const theme = useTheme();
  const [mode, setMode] = useState<'selected' | 'search'>(value ? 'selected' : 'search');
  const [query, setQuery] = useState('');

  function selectArtist(artist: Artist) {
    onChange(artist.name);
    setMode('selected');
  }

  function createNew() {
    onChange(query.trim());
    setMode('selected');
  }

  function changeArtist() {
    setQuery('');
    setMode('search');
  }

  if (mode === 'selected') {
    return (
      <ThemedView style={[styles.selectedCard, { backgroundColor: theme.background }]}>
        <ThemedText type="default" style={styles.selectedName}>
          {value}
        </ThemedText>
        <Pressable onPress={changeArtist}>
          <ThemedText type="linkPrimary">Change</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const matches =
    query.trim().length > 0
      ? artists.filter((a) => a.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6)
      : [];

  return (
    <ThemedView style={styles.searchContainer}>
      <ThemedTextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search artists..."
        style={{ backgroundColor: theme.background }}
      />
      {matches.length > 0 && (
        <ThemedView style={[styles.suggestions, { backgroundColor: theme.background }]}>
          {matches.map((artist) => (
            <Pressable key={artist.id} onPress={() => selectArtist(artist)} style={styles.suggestionRow}>
              <ThemedText type="default">{artist.name}</ThemedText>
            </Pressable>
          ))}
        </ThemedView>
      )}
      {query.trim().length > 0 && (
        <Pressable onPress={createNew}>
          <ThemedText type="linkPrimary">+ Create new artist &quot;{query.trim()}&quot;</ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  selectedCard: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  selectedName: {
    flex: 1,
  },
  searchContainer: {
    gap: Spacing.two,
  },
  suggestions: {
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  suggestionRow: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
