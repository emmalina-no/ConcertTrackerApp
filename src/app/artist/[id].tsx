import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { EventListItem } from '@/components/event-list-item';
import { StarRating } from '@/components/star-rating';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { deleteArtist, getArtist, getEventsForArtist, updateArtist } from '@/lib/api';
import { confirm } from '@/lib/confirm';
import { averageRating } from '@/lib/ratings';
import type { Artist, ConcertEvent } from '@/lib/types';

export default function ArtistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [events, setEvents] = useState<ConcertEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      Promise.all([getArtist(id), getEventsForArtist(id)])
        .then(([artistData, eventsData]) => {
          if (cancelled) return;
          setArtist(artistData);
          setName(artistData.name);
          setEvents(eventsData);
        })
        .catch((err) => {
          if (!cancelled) setLoadError(err instanceof Error ? err.message : String(err));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [id])
  );

  async function handleSave() {
    if (!artist) return;
    setActionError(null);
    setBusy(true);
    try {
      await updateArtist(artist.id, name.trim());
      setArtist({ ...artist, name: name.trim() });
      setEditing(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  function handleCancel() {
    setName(artist?.name ?? '');
    setActionError(null);
    setEditing(false);
  }

  async function handleDelete() {
    if (!artist) return;
    const confirmed = await confirm(`Delete "${artist.name}"? This cannot be undone.`);
    if (!confirmed) return;
    setActionError(null);
    setBusy(true);
    try {
      await deleteArtist(artist.id);
      router.back();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  const { average: avgRating, count: ratedCount } = averageRating(
    events.flatMap((e) => e.event_artists).map((ea) => ea.rating)
  );

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (loadError || !artist) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText type="default">{loadError ?? 'Artist not found.'}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <EventListItem
              event={item}
              rating={item.event_artists[0]?.rating ?? null}
            />
          )}
          ListHeaderComponent={
            <ThemedView style={styles.header}>
              {editing ? (
                <>
                  <ThemedTextInput value={name} onChangeText={setName} placeholder="Artist name" />
                  {actionError && (
                    <ThemedText type="small" themeColor="textSecondary">
                      {actionError}
                    </ThemedText>
                  )}
                  <ThemedView style={styles.actions}>
                    <Button
                      label="Save"
                      size="sm"
                      onPress={handleSave}
                      disabled={name.trim().length === 0}
                      loading={busy}
                    />
                    <Button
                      label="Cancel"
                      variant="secondary"
                      size="sm"
                      onPress={handleCancel}
                      disabled={busy}
                    />
                  </ThemedView>
                </>
              ) : (
                <>
                  <ThemedText type="subtitle">{artist.name}</ThemedText>
                  {ratedCount > 0 && avgRating != null ? (
                    <View style={styles.ratingSummary}>
                      <StarRating value={Math.round(avgRating)} size={16} />
                      <ThemedText type="small" themeColor="textSecondary">
                        {avgRating.toFixed(1)} average · {ratedCount} rated
                      </ThemedText>
                    </View>
                  ) : (
                    <ThemedText type="small" themeColor="textSecondary">
                      No ratings yet
                    </ThemedText>
                  )}
                  {actionError && (
                    <ThemedText type="small" themeColor="textSecondary">
                      {actionError}
                    </ThemedText>
                  )}
                  <ThemedView style={styles.actions}>
                    <Button
                      label="Edit"
                      icon="pencil"
                      variant="secondary"
                      size="sm"
                      onPress={() => setEditing(true)}
                      disabled={busy}
                    />
                    <Button
                      label="Delete"
                      icon="trash-outline"
                      variant="destructive"
                      size="sm"
                      onPress={handleDelete}
                      loading={busy}
                    />
                  </ThemedView>
                </>
              )}
            </ThemedView>
          }
          ListEmptyComponent={
            <ThemedText type="default" themeColor="textSecondary" style={styles.emptyText}>
              No concerts logged for this artist yet.
            </ThemedText>
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  header: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
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
