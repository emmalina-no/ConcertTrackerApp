import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { useFocusEffect } from "expo-router";

import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { LoadingView } from "@/components/ui/loading-view";
import { Screen } from "@/components/ui/screen";
import { StarRating } from "@/components/ui/star-rating";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { getStats } from "@/lib/api";
import type { Stats, YearStat } from "@/lib/types";

const TOP_ARTISTS_LIMIT = 5;
const CHART_COLUMN_WIDTH = 44;

function StatCard({ label, value }: { label: string; value: string | number }) {
  const theme = useTheme();
  return (
    <Card borderColor="accentWarm" style={styles.statCard}>
      <ThemedText type="stat" style={{ color: theme.accentAlt }}>
        {value}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </Card>
  );
}

function ConcertsByYearChart({ data }: { data: YearStat[] }) {
  const theme = useTheme();
  const maxCount = Math.max(...data.map((d) => d.concertCount), 1);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={true}
      contentContainerStyle={styles.chart}
    >
      {data.map((yearStat) => (
        <View key={yearStat.year} style={styles.chartColumn}>
          <ThemedText type="small" style={{ color: theme.accent }}>
            {yearStat.concertCount}
          </ThemedText>
          <View
            style={[
              styles.chartTrack,
              { backgroundColor: theme.backgroundSelected },
            ]}
          >
            <View
              style={[
                styles.chartBar,
                {
                  backgroundColor: theme.accentWarm,
                  height: `${(yearStat.concertCount / maxCount) * 100}%`,
                },
              ]}
            />
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {yearStat.year}
          </ThemedText>
        </View>
      ))}
    </ScrollView>
  );
}

export default function StatsScreen() {
  const theme = useTheme();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      getStats().then((data) => {
        if (!cancelled) {
          setStats(data);
          setLoading(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  if (loading || !stats) {
    return <LoadingView />;
  }

  return (
    <Screen edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.statRow}>
          <StatCard label="Concerts logged" value={stats.totalEvents} />
          <StatCard label="Unique artists" value={stats.uniqueArtistCount} />
          <StatCard label="Countries" value={stats.countries.length} />
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Concerts per year
          </ThemedText>
          {stats.concertsByYear.length > 0 ? (
            <ConcertsByYearChart data={stats.concertsByYear} />
          ) : (
            <ThemedText type="default" themeColor="textSecondary">
              No concerts logged yet
            </ThemedText>
          )}
        </ThemedView>
        <ThemedView type="backgroundElement" style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Countries visited
          </ThemedText>
          {stats.countries.length > 0 ? (
            <View style={styles.pillRow}>
              {stats.countries.map((country) => (
                <Chip key={country} label={country} />
              ))}
            </View>
          ) : (
            <ThemedText type="default" themeColor="textSecondary">
              —
            </ThemedText>
          )}
        </ThemedView>
        <ThemedView type="backgroundElement" style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Most-seen artists
          </ThemedText>
          <View style={styles.artistList}>
            {stats.topArtists
              .slice(0, TOP_ARTISTS_LIMIT)
              .map((artist, index) => (
                <View key={artist.artistId} style={styles.artistItem}>
                  <View
                    style={[
                      styles.artistRank,
                      { backgroundColor: theme.accent },
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={{ color: theme.onAccent }}
                    >
                      {index + 1}
                    </ThemedText>
                  </View>
                  <ThemedText
                    type="default"
                    style={[styles.artistName, { color: theme.accentAlt }]}
                  >
                    {artist.artistName}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {artist.timesSeen}×
                  </ThemedText>
                </View>
              ))}
          </View>
        </ThemedView>

        {stats.topRatedArtists.length > 0 && (
          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Highest-rated artists
            </ThemedText>
            <View style={styles.artistList}>
              {stats.topRatedArtists
                .slice(0, TOP_ARTISTS_LIMIT)
                .map((artist) => (
                  <View key={artist.artistId} style={styles.artistItem}>
                    <ThemedText
                      type="default"
                      style={[styles.artistName, { color: theme.accentAlt }]}
                    >
                      {artist.artistName}
                    </ThemedText>
                    <StarRating
                      value={Math.round(artist.averageRating ?? 0)}
                      size={14}
                    />
                    <ThemedText type="small" themeColor="textSecondary">
                      {(artist.averageRating ?? 0).toFixed(1)}
                    </ThemedText>
                  </View>
                ))}
            </View>
          </ThemedView>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  statRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.one,
  },
  section: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  sectionTitle: {
    marginBottom: Spacing.one,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.two,
    height: 160,
    paddingTop: Spacing.two,
    flexGrow: 1,
  },
  chartColumn: {
    width: CHART_COLUMN_WIDTH,
    alignItems: "center",
    gap: Spacing.one,
    height: "100%",
  },
  chartTrack: {
    flex: 1,
    width: "100%",
    borderRadius: Spacing.one,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  chartBar: {
    width: "100%",
    borderRadius: Spacing.one,
  },
  artistList: {
    gap: Spacing.one,
  },
  artistItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  artistRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  artistName: {
    flex: 1,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
});
