import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { EventListItem } from '@/components/event-list-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { deleteVenue, getEventsForVenue, getVenue, updateVenue } from '@/lib/api';
import { confirm } from '@/lib/confirm';
import type { ConcertEvent, Venue } from '@/lib/types';

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [events, setEvents] = useState<ConcertEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      Promise.all([getVenue(id), getEventsForVenue(id)])
        .then(([venueData, eventsData]) => {
          if (cancelled) return;
          setVenue(venueData);
          setName(venueData.name);
          setCity(venueData.city);
          setCountry(venueData.country);
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

  const canSave = name.trim().length > 0 && city.trim().length > 0 && country.trim().length > 0;

  async function handleSave() {
    if (!venue) return;
    setActionError(null);
    setBusy(true);
    try {
      const values = { name: name.trim(), city: city.trim(), country: country.trim() };
      await updateVenue(venue.id, values);
      setVenue({ ...venue, ...values });
      setEditing(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  function handleCancel() {
    setName(venue?.name ?? '');
    setCity(venue?.city ?? '');
    setCountry(venue?.country ?? '');
    setActionError(null);
    setEditing(false);
  }

  async function handleDelete() {
    if (!venue) return;
    const confirmed = await confirm(`Delete "${venue.name}"? This cannot be undone.`);
    if (!confirmed) return;
    setActionError(null);
    setBusy(true);
    try {
      await deleteVenue(venue.id);
      router.back();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (loadError || !venue) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText type="default">{loadError ?? 'Venue not found.'}</ThemedText>
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
          renderItem={({ item }) => <EventListItem event={item} />}
          ListHeaderComponent={
            <ThemedView style={styles.header}>
              {editing ? (
                <>
                  <ThemedTextInput value={name} onChangeText={setName} placeholder="Venue name" />
                  <ThemedTextInput value={city} onChangeText={setCity} placeholder="City" />
                  <ThemedTextInput value={country} onChangeText={setCountry} placeholder="Country" />
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
                      disabled={!canSave}
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
                  <ThemedText type="subtitle">{venue.name}</ThemedText>
                  <ThemedText type="default" themeColor="textSecondary">
                    {venue.city}, {venue.country}
                  </ThemedText>
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
              No concerts logged at this venue yet.
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
