import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArtistRow } from '@/components/artist-row';
import { SearchBar } from '@/components/search-bar';
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
  const [artistSearch, setArtistSearch] = useState('');
  const [venueSearch, setVenueSearch] = useState('');

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

  const filteredArtists = useMemo(() => {
    const q = artistSearch.trim().toLowerCase();
    if (!q) return artists;
    return artists.filter((a) => a.name.toLowerCase().includes(q));
  }, [artists, artistSearch]);

  const filteredVenues = useMemo(() => {
    const q = venueSearch.trim().toLowerCase();
    if (!q) return venues;
    return venues.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.country.toLowerCase().includes(q)
    );
  }, [venues, venueSearch]);

  const emptyText =
    (view === 'artists' ? artists.length : venues.length) === 0
      ? `No ${view} yet.`
      : `No ${view} match your search.`;

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

        <ThemedView style={styles.searchRow}>
          {view === 'artists' ? (
            <SearchBar value={artistSearch} onChangeText={setArtistSearch} placeholder="Search artists" />
          ) : (
            <SearchBar value={venueSearch} onChangeText={setVenueSearch} placeholder="Search venues" />
          )}
        </ThemedView>

        {loading ? (
          <ActivityIndicator style={styles.loading} />
        ) : view === 'artists' ? (
          <FlatList
            data={filteredArtists}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => <ArtistRow artist={item} />}
            ListEmptyComponent={
              <ThemedText type="default" themeColor="textSecondary" style={styles.emptyText}>
                {emptyText}
              </ThemedText>
            }
          />
        ) : (
          <FlatList
            data={filteredVenues}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => <VenueRow venue={item} />}
            ListEmptyComponent={
              <ThemedText type="default" themeColor="textSecondary" style={styles.emptyText}>
                {emptyText}
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
  searchRow: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
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
