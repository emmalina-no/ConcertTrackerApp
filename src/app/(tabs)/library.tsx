import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet } from "react-native";

import { ArtistRow } from "@/components/feature/artist-row";
import { Chip } from "@/components/ui/chip";
import { Screen } from "@/components/ui/screen";
import { SearchBar } from "@/components/ui/search-bar";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { VenueRow } from "@/components/feature/venue-row";
import { Spacing } from "@/constants/theme";
import { listArtists, listVenues } from "@/lib/api";
import type { Artist, Venue } from "@/lib/types";

type View = "artists" | "venues";
type Sort = "alphabetical" | "mostSeen";

const VIEW_OPTIONS: { value: View; label: string }[] = [
  { value: "artists", label: "Artists" },
  { value: "venues", label: "Venues" },
];

function sortByOption<T extends { name: string }>(
  items: T[],
  sort: Sort,
  getCount: (item: T) => number | undefined,
): T[] {
  if (sort === "alphabetical") return items;
  return [...items].sort(
    (a, b) =>
      (getCount(b) ?? 0) - (getCount(a) ?? 0) || a.name.localeCompare(b.name),
  );
}

export default function LibraryScreen() {
  const [view, setView] = useState<View>("artists");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [artistSearch, setArtistSearch] = useState("");
  const [venueSearch, setVenueSearch] = useState("");
  const [artistSort, setArtistSort] = useState<Sort>("alphabetical");
  const [venueSort, setVenueSort] = useState<Sort>("alphabetical");

  const load = useCallback(() => {
    setLoading(true);
    return Promise.all([listArtists(), listVenues()]).then(
      ([artistList, venueList]) => {
        setArtists(artistList);
        setVenues(venueList);
        setLoading(false);
      },
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filteredArtists = useMemo(() => {
    const q = artistSearch.trim().toLowerCase();
    const filtered = q
      ? artists.filter((a) => a.name.toLowerCase().includes(q))
      : artists;
    return sortByOption(filtered, artistSort, (a) => a.timesSeen);
  }, [artists, artistSearch, artistSort]);

  const filteredVenues = useMemo(() => {
    const q = venueSearch.trim().toLowerCase();
    const filtered = q
      ? venues.filter(
          (v) =>
            v.name.toLowerCase().includes(q) ||
            v.city.toLowerCase().includes(q) ||
            v.country.toLowerCase().includes(q),
        )
      : venues;
    return sortByOption(filtered, venueSort, (v) => v.timesBeen);
  }, [venues, venueSearch, venueSort]);

  // Show the current count on the active segment (once data has loaded).
  const activeCount =
    view === "artists" ? filteredArtists.length : filteredVenues.length;
  const viewOptions = useMemo(
    () =>
      VIEW_OPTIONS.map((option) =>
        option.value === view && !loading
          ? { ...option, label: `${option.label} (${activeCount})` }
          : option,
      ),
    [view, loading, activeCount],
  );

  const emptyText =
    (view === "artists" ? artists.length : venues.length) === 0
      ? `No ${view} yet.`
      : `No ${view} match your search.`;

  const sort = view === "artists" ? artistSort : venueSort;
  const setSort = view === "artists" ? setArtistSort : setVenueSort;
  const mostLabel = view === "artists" ? "Most seen" : "Most been";

  return (
    <Screen edges={["top", "bottom"]}>
      <ThemedView style={styles.toggleRow}>
        <SegmentedControl
          options={viewOptions}
          value={view}
          onChange={setView}
        />
      </ThemedView>

      <ThemedView style={styles.searchRow}>
        {view === "artists" ? (
          <SearchBar
            value={artistSearch}
            onChangeText={setArtistSearch}
            placeholder="Search artists"
          />
        ) : (
          <SearchBar
            value={venueSearch}
            onChangeText={setVenueSearch}
            placeholder="Search venues"
          />
        )}
      </ThemedView>

      <ThemedView style={styles.sortRow}>
        <Chip
          label="Alphabetical"
          selected={sort === "alphabetical"}
          onPress={() => setSort("alphabetical")}
        />
        <Chip
          label={mostLabel}
          selected={sort === "mostSeen"}
          onPress={() => setSort("mostSeen")}
        />
      </ThemedView>

      {loading ? (
        <ActivityIndicator style={styles.loading} />
      ) : view === "artists" ? (
        <FlatList
          data={filteredArtists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <ArtistRow artist={item} />}
          ListEmptyComponent={
            <ThemedText
              type="default"
              themeColor="textSecondary"
              style={styles.emptyText}
            >
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
            <ThemedText
              type="default"
              themeColor="textSecondary"
              style={styles.emptyText}
            >
              {emptyText}
            </ThemedText>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: Spacing.five,
  },
  toggleRow: {
    padding: Spacing.three,
  },
  searchRow: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  sortRow: {
    flexDirection: "row",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  listContent: {
    padding: Spacing.three,
    paddingTop: 0,
    gap: Spacing.two,
  },
  emptyText: {
    textAlign: "center",
    marginTop: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
});
