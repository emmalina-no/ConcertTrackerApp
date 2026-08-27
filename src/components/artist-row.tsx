import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Artist } from '@/lib/types';

export function ArtistRow({ artist }: { artist: Artist }) {
  const theme = useTheme();
  return (
    <Link href={{ pathname: '/artist/[id]', params: { id: artist.id } }} asChild>
      <Pressable>
        <ThemedView type="backgroundElement" style={[styles.row, { borderColor: theme.accent }]}>
          <ThemedText type="default" style={{ color: theme.accent }}>
            {artist.name}
          </ThemedText>
        </ThemedView>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: Spacing.two,
    borderWidth: 2,
    padding: Spacing.three,
  },
});
