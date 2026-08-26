import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getStats } from '@/lib/api';
import type { Stats } from '@/lib/types';

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <ThemedView type="backgroundElement" style={styles.statCard}>
      <ThemedText type="title" style={styles.statValue}>
        {value}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </ThemedView>
  );
}

export default function StatsScreen() {
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
    }, [])
  );

  if (loading || !stats) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator style={styles.loading} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedView style={styles.statRow}>
            <StatCard label="Concerts logged" value={stats.totalEvents} />
            <StatCard label="Unique artists" value={stats.uniqueArtistCount} />
            <StatCard label="Countries" value={stats.countries.length} />
          </ThemedView>

          {stats.busiestYear && (
            <ThemedView type="backgroundElement" style={styles.section}>
              <ThemedText type="smallBold">Busiest year</ThemedText>
              <ThemedText type="default">
                {stats.busiestYear.year} — {stats.busiestYear.concertCount} concerts
              </ThemedText>
            </ThemedView>
          )}

          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Concerts per year
            </ThemedText>
            {stats.concertsByYear.map((yearStat) => (
              <ThemedText key={yearStat.year} type="default">
                {yearStat.year}: {yearStat.concertCount}
              </ThemedText>
            ))}
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Most-seen artists
            </ThemedText>
            {stats.topArtists.slice(0, 20).map((artist) => (
              <ThemedText key={artist.artistId} type="default">
                {artist.artistName}: {artist.timesSeen}
              </ThemedText>
            ))}
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Countries visited
            </ThemedText>
            <ThemedText type="default">{stats.countries.join(', ') || '—'}</ThemedText>
          </ThemedView>
        </ScrollView>
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
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  statRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statCard: {
    flex: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    alignItems: 'center',
    gap: Spacing.one,
  },
  statValue: {
    fontSize: 28,
    lineHeight: 32,
  },
  section: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  sectionTitle: {
    marginBottom: Spacing.one,
  },
});
