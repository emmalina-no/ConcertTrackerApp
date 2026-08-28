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
type Sort = 'alphabetical' | 'mostSeen';

function sortByOption<T extends { name: string }>(
  items: T[],
  sort: Sort,
  getCount: (item: T) => number | undefined
): T[] {
  if (sort === 'alphabetical') return items;
  return [...items].sort(
    (a, b) => (getCount(b) ?? 0) - (getCount(a) ?? 0) || a.name.localeCompare(b.name)
  );
}

export default function LibraryScreen() {
  const theme = useTheme();
  const [view, setView] = useState<View>('artists');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [artistSearch, setArtistSearch] = useState('');
  const [venueSearch, setVenueSearch] = useState('');
  const [artistSort, setArtistSort] = useState<Sort>('alphabetical');
  const [venueSort, setVenueSort] = useState<Sort>('alphabetical');

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
    const filtered = q ? artists.filter((a) => a.name.toLowerCase().includes(q)) : artists;
    return sortByOption(filtered, artistSort, (a) => a.timesSeen);
  }, [artists, artistSearch, artistSort]);

  const filteredVenues = useMemo(() => {
    const q = venueSearch.trim().toLowerCase();
    const filtered = q
      ? venues.filter(
          (v) =>
            v.name.toLowerCase().includes(q) ||
            v.city.toLowerCase().includes(q) ||
            v.country.toLowerCase().includes(q)
        )
      : venues;
    return sortByOption(filtered, venueSort, (v) => v.timesBeen);
  }, [venues, venueSearch, venueSort]);

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
            style={[
              styles.toggleButton,
              { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
              view === 'artists' && { backgroundColor: theme.accent, borderColor: theme.accent },
            ]}>
            <ThemedText type="smallBold" style={view === 'artists' ? { color: theme.onAccent } : { color: theme.textSecondary }}>
              Artists ({artists.length})
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setView('venues')}
            style={[
              styles.toggleButton,
              { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
              view === 'venues' && { backgroundColor: theme.accent, borderColor: theme.accent },
            ]}>
            <ThemedText type="smallBold" style={view === 'venues' ? { color: theme.onAccent } : { color: theme.textSecondary }}>
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

        <ThemedView style={styles.sortRow}>
          {(view === 'artists'
            ? [
                { key: 'alphabetical' as const, label: 'Alphabetical' },
                { key: 'mostSeen' as const, label: 'Most seen' },
              ]
            : [
                { key: 'alphabetical' as const, label: 'Alphabetical' },
                { key: 'mostSeen' as const, label: 'Most been' },
              ]
          ).map((option) => {
            const active = (view === 'artists' ? artistSort : venueSort) === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => (view === 'artists' ? setArtistSort(option.key) : setVenueSort(option.key))}
                style={[
                  styles.sortChip,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                  active && { backgroundColor: theme.accent, borderColor: theme.accent },
                ]}>
                <ThemedText type="small" style={active ? { color: theme.onAccent } : { color: theme.textSecondary }}>
                  {option.label}
                </ThemedText>
              </Pressable>
            );
          })}
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
    borderWidth: 2,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  searchRow: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  sortRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  sortChip: {
    borderRadius: Spacing.two,
    borderWidth: 2,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
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
