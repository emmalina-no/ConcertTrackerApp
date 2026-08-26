import { supabase } from '@/lib/supabase';
import type { Artist, ConcertEvent, EventFormValues, Stats, Venue } from '@/lib/types';

const EVENT_SELECT = '*, venue:venues(*), event_artists(id, artist_id, played_date, artist:artists(*))';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Not authenticated');
  return data.user.id;
}

async function findOrCreateVenue(userId: string, name: string, city: string, country: string): Promise<string> {
  const { data: existing, error: findError } = await supabase
    .from('venues')
    .select('id')
    .eq('user_id', userId)
    .eq('name', name)
    .eq('city', city)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from('venues')
    .insert({ user_id: userId, name, city, country })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

async function findOrCreateArtist(userId: string, name: string): Promise<string> {
  const { data: existing, error: findError } = await supabase
    .from('artists')
    .select('id')
    .eq('user_id', userId)
    .eq('name', name)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return existing.id;

  const { data, error } = await supabase.from('artists').insert({ user_id: userId, name }).select('id').single();
  if (error) throw error;
  return data.id;
}

export async function listVenues(): Promise<Venue[]> {
  const { data, error } = await supabase.from('venues').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function listArtists(): Promise<Artist[]> {
  const { data, error } = await supabase.from('artists').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function getEvents(filter: 'past' | 'upcoming'): Promise<ConcertEvent[]> {
  const today = todayISO();
  let query = supabase.from('events').select(EVENT_SELECT);
  query = filter === 'past' ? query.lt('end_date', today) : query.gte('end_date', today);
  query = query.order('start_date', { ascending: filter === 'upcoming' });

  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as ConcertEvent[];
}

export async function getEvent(id: string): Promise<ConcertEvent> {
  const { data, error } = await supabase.from('events').select(EVENT_SELECT).eq('id', id).single();
  if (error) throw error;
  return data as unknown as ConcertEvent;
}

export async function createEvent(values: EventFormValues): Promise<string> {
  const userId = await currentUserId();
  const venueId = await findOrCreateVenue(userId, values.venueName, values.venueCity, values.venueCountry);

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      user_id: userId,
      name: values.name,
      venue_id: venueId,
      start_date: values.startDate,
      end_date: values.endDate || values.startDate,
      notes: values.notes || null,
    })
    .select('id')
    .single();
  if (error) throw error;

  await replaceEventArtists(userId, event.id, values.artists);
  return event.id;
}

export async function updateEvent(id: string, values: EventFormValues): Promise<void> {
  const userId = await currentUserId();
  const venueId = await findOrCreateVenue(userId, values.venueName, values.venueCity, values.venueCountry);

  const { error } = await supabase
    .from('events')
    .update({
      name: values.name,
      venue_id: venueId,
      start_date: values.startDate,
      end_date: values.endDate || values.startDate,
      notes: values.notes || null,
    })
    .eq('id', id);
  if (error) throw error;

  await replaceEventArtists(userId, id, values.artists);
}

async function replaceEventArtists(
  userId: string,
  eventId: string,
  artists: { name: string; playedDate: string }[]
): Promise<void> {
  const { error: deleteError } = await supabase.from('event_artists').delete().eq('event_id', eventId);
  if (deleteError) throw deleteError;

  for (const artist of artists) {
    const artistId = await findOrCreateArtist(userId, artist.name);
    const { error } = await supabase
      .from('event_artists')
      .insert({ event_id: eventId, artist_id: artistId, played_date: artist.playedDate });
    if (error) throw error;
  }
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

export async function getStats(): Promise<Stats> {
  const { data, error } = await supabase.from('events').select(EVENT_SELECT);
  if (error) throw error;
  return computeStats(data as unknown as ConcertEvent[]);
}

function computeStats(events: ConcertEvent[]): Stats {
  const artistCounts = new Map<string, { name: string; count: number }>();
  const yearCounts = new Map<number, number>();
  const countries = new Set<string>();

  for (const event of events) {
    const year = new Date(event.start_date).getFullYear();
    yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1);
    countries.add(event.venue.country);

    for (const eventArtist of event.event_artists) {
      const existing = artistCounts.get(eventArtist.artist_id);
      artistCounts.set(eventArtist.artist_id, {
        name: eventArtist.artist.name,
        count: (existing?.count ?? 0) + 1,
      });
    }
  }

  const topArtists = Array.from(artistCounts.entries())
    .map(([artistId, { name, count }]) => ({ artistId, artistName: name, timesSeen: count }))
    .sort((a, b) => b.timesSeen - a.timesSeen || a.artistName.localeCompare(b.artistName));

  const concertsByYear = Array.from(yearCounts.entries())
    .map(([year, concertCount]) => ({ year, concertCount }))
    .sort((a, b) => a.year - b.year);

  const busiestYear = concertsByYear.reduce<Stats['busiestYear']>((max, current) => {
    if (!max || current.concertCount > max.concertCount) return current;
    return max;
  }, null);

  return {
    topArtists,
    uniqueArtistCount: artistCounts.size,
    concertsByYear,
    busiestYear,
    countries: Array.from(countries).sort(),
    totalEvents: events.length,
  };
}
