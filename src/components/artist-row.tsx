import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { deleteArtist, updateArtist } from '@/lib/api';
import { confirm } from '@/lib/confirm';
import type { Artist } from '@/lib/types';

export function ArtistRow({ artist, onChanged }: { artist: Artist; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(artist.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setBusy(true);
    try {
      await updateArtist(artist.id, name.trim());
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  function handleCancel() {
    setName(artist.name);
    setError(null);
    setEditing(false);
  }

  async function handleDelete() {
    const confirmed = await confirm(`Delete "${artist.name}"? This cannot be undone.`);
    if (!confirmed) return;
    setError(null);
    setBusy(true);
    try {
      await deleteArtist(artist.id);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <ThemedView type="backgroundElement" style={styles.row}>
        <ThemedTextInput value={name} onChangeText={setName} placeholder="Artist name" />
        {error && (
          <ThemedText type="small" themeColor="textSecondary">
            {error}
          </ThemedText>
        )}
        <ThemedView style={styles.actions}>
          <Pressable onPress={handleSave} disabled={busy || name.trim().length === 0}>
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
      <ThemedText type="default">{artist.name}</ThemedText>
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
