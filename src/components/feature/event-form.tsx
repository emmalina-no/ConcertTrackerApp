import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";

import { ArtistFields } from "@/components/feature/artist-fields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DateField } from "@/components/ui/date-field";
import { FormField } from "@/components/ui/form-field";
import { TextField } from "@/components/ui/text-field";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { VenuePicker } from "@/components/feature/venue-picker";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { listArtists, listVenues } from "@/lib/api";
import { confirm } from "@/lib/confirm";
import type { Artist, EventFormValues, Venue } from "@/lib/types";
import { filled } from "@/lib/validation";

const emptyArtist = () => ({ name: "", playedDate: "", rating: null });

const defaultValues: EventFormValues = {
  name: "",
  startDate: "",
  endDate: "",
  notes: "",
  venueName: "",
  venueCity: "",
  venueCountry: "",
  artists: [emptyArtist()],
};

export function EventForm({
  initialValues,
  onSubmit,
  submitLabel,
  onDelete,
}: {
  initialValues?: EventFormValues;
  onSubmit: (values: EventFormValues) => Promise<void>;
  submitLabel: string;
  onDelete?: () => Promise<void>;
}) {
  const [values, setValues] = useState<EventFormValues>(
    initialValues ?? defaultValues,
  );
  const [multiDay, setMultiDay] = useState<boolean>(() => {
    if (!initialValues) return false;
    if (initialValues.endDate) return true;
    return initialValues.artists.some(
      (a) => a.playedDate && a.playedDate !== initialValues.startDate,
    );
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    listVenues().then(setVenues);
    listArtists().then(setArtists);
  }, []);

  function updateArtist(
    index: number,
    patch: Partial<EventFormValues["artists"][number]>,
  ) {
    setValues((prev) => ({
      ...prev,
      artists: prev.artists.map((artist, i) =>
        i === index ? { ...artist, ...patch } : artist,
      ),
    }));
  }

  function addArtist() {
    setValues((prev) => ({
      ...prev,
      artists: [
        ...prev.artists,
        { name: "", playedDate: prev.startDate, rating: null },
      ],
    }));
  }

  function removeArtist(index: number) {
    setValues((prev) => ({
      ...prev,
      artists: prev.artists.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        ...values,
        endDate: multiDay ? values.endDate : "",
        artists: values.artists
          .filter((a) => a.name.trim().length > 0)
          .map((a) => ({
            name: a.name,
            playedDate: multiDay
              ? a.playedDate || values.startDate
              : values.startDate,
            rating: a.rating ?? null,
          })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    const confirmed = await confirm(
      "This will permanently delete this concert. This cannot be undone.",
    );
    if (!confirmed) return;
    setError(null);
    setSubmitting(true);
    try {
      await onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  }

  async function handleRemoveArtist(index: number) {
    const artist = values.artists[index];
    if (artist.name.trim().length === 0) {
      removeArtist(index);
      return;
    }
    const confirmed = await confirm(
      `Remove ${artist.name} from this concert's lineup?`,
    );
    if (confirmed) removeArtist(index);
  }

  const canSubmit = filled(values.name, values.startDate, values.venueName);
  const startDate = values.startDate ? new Date(values.startDate) : undefined;
  const endDate = values.endDate ? new Date(values.endDate) : undefined;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <ThemedView style={styles.form}>
        <TextField
          label="Event name"
          value={values.name}
          onChangeText={(name) => setValues((p) => ({ ...p, name }))}
          placeholder="Tons of Rock"
        />
        <FormField label="Start date">
          <DateField
            value={values.startDate}
            onChange={(startDate) => setValues((p) => ({ ...p, startDate }))}
          />
        </FormField>
        <Checkbox
          label="Multi-day concert"
          checked={multiDay}
          onChange={setMultiDay}
        />
        {multiDay && (
          <FormField label="End date">
            <DateField
              value={values.endDate}
              onChange={(endDate) => setValues((p) => ({ ...p, endDate }))}
              minDate={startDate}
              clearable
            />
          </FormField>
        )}
        <FormField label="Venue">
          <VenuePicker
            venues={venues}
            value={{
              name: values.venueName,
              city: values.venueCity,
              country: values.venueCountry,
            }}
            onChange={({ name, city, country }) =>
              setValues((p) => ({
                ...p,
                venueName: name,
                venueCity: city,
                venueCountry: country,
              }))
            }
          />
        </FormField>
        <TextField
          label="Notes"
          value={values.notes}
          onChangeText={(notes) => setValues((p) => ({ ...p, notes }))}
          placeholder="Optional"
        />

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Artists
        </ThemedText>
        {values.artists.map((artist, index) => (
          <ArtistFields
            key={index}
            artist={artist}
            artists={artists}
            multiDay={multiDay}
            minDate={startDate}
            maxDate={endDate}
            onChange={(patch) => updateArtist(index, patch)}
            onRemove={() => handleRemoveArtist(index)}
          />
        ))}
        <Pressable onPress={addArtist} style={styles.addArtistButton}>
          <ThemedText type="linkPrimary">+ Add artist</ThemedText>
        </Pressable>

        {error && (
          <ThemedText type="small" themeColor="textSecondary">
            {error}
          </ThemedText>
        )}

        <Button
          label={submitLabel}
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={submitting}
          style={styles.submitButton}
        />

        {onDelete && (
          <Button
            label="Delete concert"
            variant="destructive"
            onPress={handleDelete}
            disabled={submitting}
          />
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    alignItems: "center",
  },
  form: {
    width: "100%",
    maxWidth: MaxContentWidth,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  sectionTitle: {
    marginTop: Spacing.two,
  },
  addArtistButton: {
    alignSelf: "flex-start",
  },
  submitButton: {
    marginTop: Spacing.two,
  },
});
