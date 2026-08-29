import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/button";
import { EventListItem } from "@/components/feature/event-list-item";
import { LoadingView } from "@/components/ui/loading-view";
import { Screen } from "@/components/ui/screen";
import { StarRating } from "@/components/ui/star-rating";
import { TextField } from "@/components/ui/text-field";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { Spacing } from "@/constants/theme";
import { useEditForm } from "@/hooks/use-edit-form";
import {
  deleteArtist,
  getArtist,
  getEventsForArtist,
  updateArtist,
} from "@/lib/api";
import { averageRating } from "@/lib/ratings";
import type { Artist, ConcertEvent } from "@/lib/types";
import { filled } from "@/lib/validation";

export default function ArtistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [events, setEvents] = useState<ConcertEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      Promise.all([getArtist(id), getEventsForArtist(id)])
        .then(([artistData, eventsData]) => {
          if (cancelled) return;
          setArtist(artistData);
          setEvents(eventsData);
        })
        .catch((err) => {
          if (!cancelled)
            setLoadError(err instanceof Error ? err.message : String(err));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [id]),
  );

  const form = useEditForm({
    initial: { name: artist?.name ?? "" },
    validate: ({ name }) => filled(name),
    onSave: async ({ name }) => {
      if (!artist) return;
      await updateArtist(artist.id, name.trim());
      setArtist({ ...artist, name: name.trim() });
    },
    onDelete: async () => {
      if (!artist) return;
      await deleteArtist(artist.id);
      router.back();
    },
    deleteMessage: artist
      ? `Delete "${artist.name}"? This cannot be undone.`
      : undefined,
  });

  const { average: avgRating, count: ratedCount } = averageRating(
    events.flatMap((e) => e.event_artists).map((ea) => ea.rating),
  );

  if (loading) return <LoadingView />;
  if (loadError || !artist)
    return <LoadingView message={loadError ?? "Artist not found."} />;

  return (
    <Screen>
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
            {form.editing ? (
              <>
                <TextField
                  label="Artist name"
                  value={form.values.name}
                  onChangeText={(name) => form.setValues({ name })}
                  placeholder="Artist name"
                  error={form.error}
                />
                <ThemedView style={styles.actions}>
                  <Button
                    label="Save"
                    size="sm"
                    onPress={form.save}
                    disabled={!form.canSave}
                    loading={form.busy}
                  />
                  <Button
                    label="Cancel"
                    variant="secondary"
                    size="sm"
                    onPress={form.cancel}
                    disabled={form.busy}
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
                {form.error && (
                  <ThemedText type="destructive">{form.error}</ThemedText>
                )}
                <ThemedView style={styles.actions}>
                  <Button
                    label="Edit"
                    icon="pencil"
                    variant="secondary"
                    size="sm"
                    onPress={form.startEditing}
                    disabled={form.busy}
                  />
                  <Button
                    label="Delete"
                    icon="trash-outline"
                    variant="destructive"
                    size="sm"
                    onPress={form.remove}
                    loading={form.busy}
                  />
                </ThemedView>
              </>
            )}
          </ThemedView>
        }
        ListEmptyComponent={
          <ThemedText
            type="default"
            themeColor="textSecondary"
            style={styles.emptyText}
          >
            No concerts logged for this artist yet.
          </ThemedText>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  ratingSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
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
