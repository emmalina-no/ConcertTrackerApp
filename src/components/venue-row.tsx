import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { deleteVenue, updateVenue } from '@/lib/api';
import { confirm } from '@/lib/confirm';
import type { Venue } from '@/lib/types';

export function VenueRow({ venue, onChanged }: { venue: Venue; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(venue.name);
  const [city, setCity] = useState(venue.city);
  const [country, setCountry] = useState(venue.country);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setBusy(true);
    try {
      await updateVenue(venue.id, { name: name.trim(), city: city.trim(), country: country.trim() });
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  function handleCancel() {
    setName(venue.name);
    setCity(venue.city);
    setCountry(venue.country);
    setError(null);
    setEditing(false);
  }

  async function handleDelete() {
    const confirmed = await confirm(`Delete "${venue.name}"? This cannot be undone.`);
    if (!confirmed) return;
    setError(null);
    setBusy(true);
    try {
      await deleteVenue(venue.id);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  const canSave = name.trim().length > 0 && city.trim().length > 0 && country.trim().length > 0;

  if (editing) {
    return (
      <ThemedView type="backgroundElement" style={styles.row}>
        <ThemedTextInput value={name} onChangeText={setName} placeholder="Venue name" />
        <ThemedTextInput value={city} onChangeText={setCity} placeholder="City" />
        <ThemedTextInput value={country} onChangeText={setCountry} placeholder="Country" />
        {error && (
          <ThemedText type="small" themeColor="textSecondary">
            {error}
          </ThemedText>
        )}
        <ThemedView style={styles.actions}>
          <Pressable onPress={handleSave} disabled={busy || !canSave}>
            {busy ? <ActivityIndicator /> : <ThemedText type="linkPrimary">Save</ThemedText>}
          </Pressable>
          <Pressable onPress={handleCancel} disabled={busy}>
            <ThemedText type="link">Cancel</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <ThemedText type="default">{venue.name}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {venue.city}, {venue.country}
      </ThemedText>
      {error && (
        <ThemedText type="small" themeColor="textSecondary">
          {error}
        </ThemedText>
      )}
      <ThemedView style={styles.actions}>
        <Pressable onPress={() => setEditing(true)} disabled={busy}>
          <ThemedText type="linkPrimary">Edit</ThemedText>
        </Pressable>
        <Pressable onPress={handleDelete} disabled={busy}>
          {busy ? <ActivityIndicator /> : <ThemedText type="link" themeColor="textSecondary">Delete</ThemedText>}
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
});
