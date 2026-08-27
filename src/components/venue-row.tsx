import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Venue } from '@/lib/types';

export function VenueRow({ venue }: { venue: Venue }) {
  return (
    <Link href={{ pathname: '/venue/[id]', params: { id: venue.id } }} asChild>
      <Pressable>
        <ThemedView type="backgroundElement" style={styles.row}>
          <ThemedText type="default">{venue.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {venue.city}, {venue.country}
          </ThemedText>
        </ThemedView>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.half,
  },
});
