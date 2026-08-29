export type Venue = {
  id: string;
  name: string;
  city: string;
  country: string;
  timesBeen?: number;
};

/** A venue's editable fields, without identity — used by forms and pickers. */
export type VenueValue = {
  name: string;
  city: string;
  country: string;
};

export type Artist = {
  id: string;
  name: string;
  timesSeen?: number;
  averageRating?: number | null;
  ratedCount?: number;
};

export type EventArtist = {
  id: string;
  artist_id: string;
  played_date: string;
  rating: number | null;
  artist: Artist;
};

export type ConcertEvent = {
  id: string;
  name: string;
  venue_id: string;
  start_date: string;
  end_date: string;
  notes: string | null;
  venue: Venue;
  event_artists: EventArtist[];
};

export type EventFormValues = {
  name: string;
  startDate: string;
  endDate: string;
  notes: string;
  venueName: string;
  venueCity: string;
  venueCountry: string;
  artists: { name: string; playedDate: string; rating: number | null }[];
};

export type ArtistStat = {
  artistId: string;
  artistName: string;
  timesSeen: number;
  averageRating: number | null;
  ratedCount: number;
};

export type YearStat = {
  year: number;
  concertCount: number;
};

export type Stats = {
  topArtists: ArtistStat[];
  topRatedArtists: ArtistStat[];
  uniqueArtistCount: number;
  concertsByYear: YearStat[];
  busiestYear: YearStat | null;
  countries: string[];
  totalEvents: number;
};
