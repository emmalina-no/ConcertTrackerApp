import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet } from "react-native";

import { Button } from "@/components/ui/button";
import { EventListItem } from "@/components/feature/event-list-item";
import { LoadingView } from "@/components/ui/loading-view";
import { Screen } from "@/components/ui/screen";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { VenueFields } from "@/components/feature/venue-fields";
import { Spacing } from "@/constants/theme";
import { useEditForm } from "@/hooks/use-edit-form";
import {
  deleteVenue,
  getEventsForVenue,
  getVenue,
  updateVenue,
} from "@/lib/api";
import type { ConcertEvent, Venue, VenueValue } from "@/lib/types";
import { filled } from "@/lib/validation";

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [events, setEvents] = useState<ConcertEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      Promise.all([getVenue(id), getEventsForVenue(id)])
        .then(([venueData, eventsData]) => {
          if (cancelled) return;
          setVenue(venueData);
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

  const initial: VenueValue = {
    name: venue?.name ?? "",
    city: venue?.city ?? "",
    country: venue?.country ?? "",
  };

  const form = useEditForm<VenueValue>({
    initial,
    validate: ({ name, city, country }) => filled(name, city, country),
    onSave: async (values) => {
      if (!venue) return;
      const trimmed = {
        name: values.name.trim(),
        city: values.city.trim(),
        country: values.country.trim(),
      };
      await updateVenue(venue.id, trimmed);
      setVenue({ ...venue, ...trimmed });
    },
    onDelete: async () => {
      if (!venue) return;
      await deleteVenue(venue.id);
      router.back();
    },
    deleteMessage: venue
      ? `Delete "${venue.name}"? This cannot be undone.`
      : undefined,
  });

  if (loading) return <LoadingView />;
  if (loadError || !venue)
    return <LoadingView message={loadError ?? "Venue not found."} />;

  return (
    <Screen>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <EventListItem event={item} />}
        ListHeaderComponent={
          <ThemedView style={styles.header}>
            {form.editing ? (
              <>
                <VenueFields value={form.values} onChange={form.setValues} />
                {form.error && (
                  <ThemedText type="destructive">{form.error}</ThemedText>
                )}
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
                <ThemedText type="subtitle">{venue.name}</ThemedText>
                <ThemedText type="default" themeColor="textSecondary">
                  {venue.city}, {venue.country}
                </ThemedText>
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
            No concerts logged at this venue yet.
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
