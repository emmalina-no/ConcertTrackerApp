import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { ConcertEvent } from '@/lib/types';

function formatDateRange(startDate: string, endDate: string) {
  if (startDate === endDate) return startDate;
  return `${startDate} – ${endDate}`;
}

export function EventListItem({ event }: { event: ConcertEvent }) {
  const artistNames = event.event_artists.map((ea) => ea.artist.name).join(', ');

  return (
    <Link href={{ pathname: '/event/[id]', params: { id: event.id } }} asChild>
      <Pressable>
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">{formatDateRange(event.start_date, event.end_date)}</ThemedText>
          <ThemedText type="subtitle" style={styles.name}>
            {event.name}
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            {event.venue.name}, {event.venue.city}, {event.venue.country}
          </ThemedText>
          {artistNames.length > 0 && (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
              {artistNames}
            </ThemedText>
          )}
        </ThemedView>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  name: {
    fontSize: 20,
    lineHeight: 26,
  },
});
