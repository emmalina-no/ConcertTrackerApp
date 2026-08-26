import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';

import { ArtistNameField } from '@/components/artist-name-field';
import { DateField } from '@/components/date-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { VenuePicker } from '@/components/venue-picker';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { listArtists, listVenues } from '@/lib/api';
import type { Artist, EventFormValues, Venue } from '@/lib/types';

function confirm(message: string): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(message));
  return new Promise((resolve) => {
    Alert.alert('Are you sure?', message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

const emptyArtist = () => ({ name: '', playedDate: '' });

const defaultValues: EventFormValues = {
  name: '',
  startDate: '',
  endDate: '',
  notes: '',
  venueName: '',
  venueCity: '',
  venueCountry: '',
  artists: [emptyArtist()],
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}) {
  return (
    <ThemedView style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <ThemedTextInput value={value} onChangeText={onChangeText} placeholder={placeholder} />
    </ThemedView>
  );
}

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
  const [values, setValues] = useState<EventFormValues>(initialValues ?? defaultValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    listVenues().then(setVenues);
    listArtists().then(setArtists);
  }, []);

  function updateArtist(index: number, patch: Partial<EventFormValues['artists'][number]>) {
    setValues((prev) => ({
      ...prev,
      artists: prev.artists.map((artist, i) => (i === index ? { ...artist, ...patch } : artist)),
    }));
  }

  function addArtist() {
    setValues((prev) => ({ ...prev, artists: [...prev.artists, { name: '', playedDate: prev.startDate }] }));
  }

  function removeArtist(index: number) {
    setValues((prev) => ({ ...prev, artists: prev.artists.filter((_, i) => i !== index) }));
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        ...values,
        artists: values.artists.filter((a) => a.name.trim().length > 0),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    const confirmed = await confirm('This will permanently delete this concert. This cannot be undone.');
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
    const confirmed = await confirm(`Remove ${artist.name} from this concert's lineup?`);
    if (confirmed) removeArtist(index);
  }

  const canSubmit = values.name.trim().length > 0 && values.startDate.trim().length > 0 && values.venueName.trim().length > 0;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <ThemedView style={styles.form}>
        <Field label="Event name" value={values.name} onChangeText={(name) => setValues((p) => ({ ...p, name }))} placeholder="Tons of Rock" />
        <ThemedView style={styles.field}>
          <ThemedText type="smallBold">Start date</ThemedText>
          <DateField value={values.startDate} onChange={(startDate) => setValues((p) => ({ ...p, startDate }))} />
        </ThemedView>
        <ThemedView style={styles.field}>
          <ThemedText type="smallBold">End date (leave blank if single-day)</ThemedText>
          <DateField
            value={values.endDate}
            onChange={(endDate) => setValues((p) => ({ ...p, endDate }))}
            placeholder="Same as start date"
            clearable
          />
        </ThemedView>
        <ThemedView style={styles.field}>
          <ThemedText type="smallBold">Venue</ThemedText>
          <VenuePicker
            venues={venues}
            value={{ name: values.venueName, city: values.venueCity, country: values.venueCountry }}
            onChange={({ name, city, country }) =>
              setValues((p) => ({ ...p, venueName: name, venueCity: city, venueCountry: country }))
            }
          />
        </ThemedView>
        <Field label="Notes" value={values.notes} onChangeText={(notes) => setValues((p) => ({ ...p, notes }))} placeholder="Optional" />

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Artists
        </ThemedText>
        {values.artists.map((artist, index) => (
          <ThemedView key={index} type="backgroundElement" style={styles.artistRow}>
            <ArtistNameField artists={artists} value={artist.name} onChangeText={(name) => updateArtist(index, { name })} />
            <DateField value={artist.playedDate} onChange={(playedDate) => updateArtist(index, { playedDate })} placeholder="Played date" />
            <Pressable onPress={() => handleRemoveArtist(index)} style={styles.removeButton}>
              <ThemedText type="link">Remove</ThemedText>
            </Pressable>
          </ThemedView>
        ))}
        <Pressable onPress={addArtist} style={styles.addArtistButton}>
          <ThemedText type="linkPrimary">+ Add artist</ThemedText>
        </Pressable>

        {error && (
          <ThemedText type="small" themeColor="textSecondary">
            {error}
          </ThemedText>
        )}

        <Pressable onPress={handleSubmit} disabled={!canSubmit || submitting} style={[styles.button, (!canSubmit || submitting) && styles.buttonDisabled]}>
          {submitting ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.buttonText}>{submitLabel}</ThemedText>}
        </Pressable>

        {onDelete && (
          <Pressable onPress={handleDelete} disabled={submitting} style={styles.deleteButton}>
            <ThemedText type="link" themeColor="textSecondary">
              Delete concert
            </ThemedText>
          </Pressable>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    alignItems: 'center',
  },
  form: {
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.one,
  },
  sectionTitle: {
    marginTop: Spacing.two,
  },
  artistRow: {
    borderRadius: Spacing.two,
    padding: Spacing.two,
    gap: Spacing.one,
  },
  removeButton: {
    alignSelf: 'flex-end',
  },
  addArtistButton: {
    alignSelf: 'flex-start',
  },
  button: {
    backgroundColor: '#3c87f7',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two + 2,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
});
