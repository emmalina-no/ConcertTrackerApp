import { Link } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  View as RNView,
  StyleSheet,
} from "react-native";

import {
  ConcertFiltersPanel,
  EMPTY_FILTERS,
  matchesConcertFilters,
  type ConcertFilters,
} from "@/components/feature/concert-filters";
import { EventListItem } from "@/components/feature/event-list-item";
import { Screen } from "@/components/ui/screen";
import { SearchBar } from "@/components/ui/search-bar";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { Spacing } from "@/constants/theme";
import { useEventList } from "@/hooks/use-event-list";
import { useTheme } from "@/hooks/use-theme";

type View = "past" | "upcoming";

const VIEW_OPTIONS: { value: View; label: string }[] = [
  { value: "past", label: "Past" },
  { value: "upcoming", label: "Upcoming" },
];

export default function ConcertsScreen() {
  const theme = useTheme();
  const [view, setView] = useState<View>("past");
  const { events, loading, error } = useEventList(view);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ConcertFilters>(EMPTY_FILTERS);

  function selectView(next: View) {
    setView(next);
    setSearch("");
    setFilters(EMPTY_FILTERS);
  }

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((event) => {
      if (!matchesConcertFilters(event, filters)) return false;
      if (q.length === 0) return true;
      const artistNames = event.event_artists.map((ea) =>
        ea.artist.name.toLowerCase(),
      );
      return (
        event.name.toLowerCase().includes(q) ||
        event.venue.name.toLowerCase().includes(q) ||
        artistNames.some((n) => n.includes(q))
      );
    });
  }, [events, filters, search]);

  const emptyText =
    events.length === 0
      ? view === "upcoming"
        ? "No upcoming concerts yet."
        : "No past concerts logged yet."
      : "No concerts match your search or filters.";

  return (
    <Screen>
      <ThemedView style={styles.toggleRow}>
        <SegmentedControl
          options={VIEW_OPTIONS}
          value={view}
          onChange={selectView}
        />
      </ThemedView>

      <ThemedView style={styles.searchRow}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search concerts, artists, venues"
        />
      </ThemedView>

      <ConcertFiltersPanel
        events={events}
        filters={filters}
        onChange={setFilters}
      />

      {loading ? (
        <ActivityIndicator style={styles.loading} />
      ) : error ? (
        <ThemedText type="default" style={styles.centerText}>
          {error}
        </ThemedText>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <EventListItem event={item} />}
          ListEmptyComponent={
            <ThemedText
              type="default"
              themeColor="textSecondary"
              style={styles.centerText}
            >
              {emptyText}
            </ThemedText>
          }
        />
      )}

      <Link href="/event/new" asChild>
        <Pressable
          style={StyleSheet.flatten([
            styles.fab,
            {
              backgroundColor: theme.accentAlt,
              borderColor: theme.accentWarm,
            },
          ])}
        >
          <RNView style={styles.fabIcon}>
            <RNView
              style={[
                styles.fabIconBar,
                styles.fabIconH,
                { backgroundColor: theme.backgroundElement },
              ]}
            />
            <RNView
              style={[
                styles.fabIconBar,
                styles.fabIconV,
                { backgroundColor: theme.backgroundElement },
              ]}
            />
          </RNView>
        </Pressable>
      </Link>
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
  centerText: {
    textAlign: "center",
    marginTop: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  listContent: {
    padding: Spacing.three,
    paddingTop: 0,
    gap: Spacing.two,
  },
  fab: {
    position: "absolute",
    right: Spacing.three,
    bottom: Spacing.three,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  fabIcon: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  fabIconBar: {
    position: "absolute",
    borderRadius: 1.5,
  },
  fabIconH: {
    width: 22,
    height: 3,
  },
  fabIconV: {
    width: 3,
    height: 22,
  },
});
