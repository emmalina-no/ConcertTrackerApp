import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArtistRow } from '@/components/artist-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VenueRow } from '@/components/venue-row';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { listArtists, listVenues } from '@/lib/api';
import type { Artist, Venue } from '@/lib/types';

type View = 'artists' | 'venues';

export default function LibraryScreen() {
  const theme = useTheme();
  const [view, setView] = useState<View>('artists');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    return Promise.all([listArtists(), listVenues()]).then(([artistList, venueList]) => {
      setArtists(artistList);
      setVenues(venueList);
      setLoading(false);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ThemedView style={styles.toggleRow}>
          <Pressable
            onPress={() => setView('artists')}
            style={[styles.toggleButton, { backgroundColor: theme.backgroundElement }, view === 'artists' && styles.toggleButtonActive]}>
            <ThemedText type="smallBold" style={view === 'artists' && styles.toggleTextActive}>
              Artists ({artists.length})
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setView('venues')}
            style={[styles.toggleButton, { backgroundColor: theme.backgroundElement }, view === 'venues' && styles.toggleButtonActive]}>
            <ThemedText type="smallBold" style={view === 'venues' && styles.toggleTextActive}>
              Venues ({venues.length})
            </ThemedText>
          </Pressable>
        </ThemedView>

        {loading ? (
          <ActivityIndicator style={styles.loading} />
        ) : view === 'artists' ? (
          <FlatList
            data={artists}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => <ArtistRow artist={item} onChanged={load} />}
            ListEmptyComponent={
              <ThemedText type="default" themeColor="textSecondary" style={styles.emptyText}>
                No artists yet.
              </ThemedText>
            }
          />
        ) : (
          <FlatList
            data={venues}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => <VenueRow venue={item} onChanged={load} />}
            ListEmptyComponent={
              <ThemedText type="default" themeColor="textSecondary" style={styles.emptyText}>
                No venues yet.
              </ThemedText>
            }
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  loading: {
    marginTop: Spacing.five,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  toggleButton: {
    flex: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#3c87f7',
  },
  toggleTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: Spacing.three,
    paddingTop: 0,
    gap: Spacing.two,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
});
