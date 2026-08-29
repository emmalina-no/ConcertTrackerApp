import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { EventForm } from '@/components/feature/event-form';
import { LoadingView } from '@/components/ui/loading-view';
import { deleteEvent, getEvent, updateEvent } from '@/lib/api';
import type { ConcertEvent, EventFormValues } from '@/lib/types';

function toFormValues(event: ConcertEvent): EventFormValues {
  return {
    name: event.name,
    startDate: event.start_date,
    endDate: event.end_date === event.start_date ? '' : event.end_date,
    notes: event.notes ?? '',
    venueName: event.venue.name,
    venueCity: event.venue.city,
    venueCountry: event.venue.country,
    artists: event.event_artists
      .slice()
      .sort((a, b) => a.played_date.localeCompare(b.played_date))
      .map((ea) => ({
        name: ea.artist.name,
        playedDate: ea.played_date,
        rating: ea.rating,
      })),
  };
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<ConcertEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvent(id).then((data) => {
      setEvent(data);
      setLoading(false);
    });
  }, [id]);

  if (loading || !event) {
    return <LoadingView />;
  }

  async function handleSubmit(values: EventFormValues) {
    await updateEvent(id, values);
    router.back();
  }

  async function handleDelete() {
    await deleteEvent(id);
    router.back();
  }

  return <EventForm initialValues={toFormValues(event)} submitLabel="Save changes" onSubmit={handleSubmit} onDelete={handleDelete} />;
}
