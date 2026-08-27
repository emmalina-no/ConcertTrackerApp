import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Artist } from '@/lib/types';

export function ArtistRow({ artist }: { artist: Artist }) {
  return (
    <Link href={{ pathname: '/artist/[id]', params: { id: artist.id } }} asChild>
      <Pressable>
        <ThemedView type="backgroundElement" style={styles.row}>
          <ThemedText type="default">{artist.name}</ThemedText>
        </ThemedView>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
  },
});
