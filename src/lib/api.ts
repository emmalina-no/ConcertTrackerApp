import { averageRating } from "@/lib/ratings";
import { supabase } from "@/lib/supabase";
import type {
	Artist,
	ArtistStat,
	ConcertEvent,
	EventFormValues,
	Stats,
	Venue,
} from "@/lib/types";

const EVENT_SELECT =
	"*, venue:venues(*), event_artists(id, artist_id, played_date, rating, artist:artists(*))";

function todayISO() {
	return new Date().toISOString().slice(0, 10);
}

async function currentUserId(): Promise<string> {
	const { data, error } = await supabase.auth.getUser();
	if (error || !data.user) throw new Error("Not authenticated");
	return data.user.id;
}

async function findOrCreateVenue(
	userId: string,
	name: string,
	city: string,
	country: string,
): Promise<string> {
	const { data: existing, error: findError } = await supabase
		.from("venues")
		.select("id")
		.eq("user_id", userId)
		.eq("name", name)
		.eq("city", city)
		.maybeSingle();
	if (findError) throw findError;
	if (existing) return existing.id;

	const { data, error } = await supabase
		.from("venues")
		.insert({ user_id: userId, name, city, country })
		.select("id")
		.single();
	if (error) throw error;
	return data.id;
}

async function findOrCreateArtist(
	userId: string,
	name: string,
): Promise<string> {
	const { data: existing, error: findError } = await supabase
		.from("artists")
		.select("id")
		.eq("user_id", userId)
		.eq("name", name)
		.maybeSingle();
	if (findError) throw findError;
	if (existing) return existing.id;

	const { data, error } = await supabase
		.from("artists")
		.insert({ user_id: userId, name })
		.select("id")
		.single();
	if (error) throw error;
	return data.id;
}

export async function listVenues(): Promise<Venue[]> {
	const today = todayISO();
	const { data, error } = await supabase
		.from("venues")
		.select("*, events(count)")
		.lt("events.end_date", today)
		.order("name");
	if (error) throw error;
	return (
		data as unknown as (Venue & { events: { count: number }[] })[]
	).map(({ events, ...venue }) => ({
		...venue,
		timesBeen: events[0]?.count ?? 0,
	}));
}

export async function listArtists(): Promise<Artist[]> {
	const today = todayISO();
	const { data, error } = await supabase
		.from("artists")
		.select("*, event_artists(rating, played_date)")
		.lt("event_artists.played_date", today)
		.order("name");
	if (error) throw error;
	return (
		data as unknown as (Artist & {
			event_artists: { rating: number | null; played_date: string }[];
		})[]
	).map(({ event_artists, ...artist }) => {
		const { average, count } = averageRating(
			event_artists.map((ea) => ea.rating),
		);
		return {
			...artist,
			timesSeen: event_artists.length,
			averageRating: average,
			ratedCount: count,
		};
	});
}

export async function getArtist(id: string): Promise<Artist> {
	const { data, error } = await supabase
		.from("artists")
		.select("*")
		.eq("id", id)
		.single();
	if (error) throw error;
	return data;
}

export async function getVenue(id: string): Promise<Venue> {
	const { data, error } = await supabase
		.from("venues")
		.select("*")
		.eq("id", id)
		.single();
	if (error) throw error;
	return data;
}

export async function updateArtist(id: string, name: string): Promise<void> {
	const { error } = await supabase
		.from("artists")
		.update({ name })
		.eq("id", id);
	if (error) throw error;
}

export async function deleteArtist(id: string): Promise<void> {
	const { error } = await supabase.from("artists").delete().eq("id", id);
	if (error) {
		if (error.code === "23503") {
			throw new Error(
				"This artist is used in one or more concerts. Remove them from those concerts first.",
			);
		}
		throw error;
	}
}

export async function updateVenue(
	id: string,
	values: { name: string; city: string; country: string },
): Promise<void> {
	const { error } = await supabase.from("venues").update(values).eq("id", id);
	if (error) throw error;
}

export async function deleteVenue(id: string): Promise<void> {
	const { error } = await supabase.from("venues").delete().eq("id", id);
	if (error) {
		if (error.code === "23503") {
			throw new Error(
				"This venue has concerts logged at it. Edit or delete those concerts first.",
			);
		}
		throw error;
	}
}

export async function getEvents(
	filter: "past" | "upcoming",
): Promise<ConcertEvent[]> {
	const today = todayISO();
	let query = supabase.from("events").select(EVENT_SELECT);
	query =
		filter === "past"
			? query.lt("end_date", today)
			: query.gte("end_date", today);
	query = query.order("start_date", { ascending: filter === "upcoming" });

	const { data, error } = await query;
	if (error) throw error;
	return data as unknown as ConcertEvent[];
}

export async function getEvent(id: string): Promise<ConcertEvent> {
	const { data, error } = await supabase
		.from("events")
		.select(EVENT_SELECT)
		.eq("id", id)
		.single();
	if (error) throw error;
	return data as unknown as ConcertEvent;
}

export async function getEventsForArtist(
	artistId: string,
): Promise<ConcertEvent[]> {
	const { data, error } = await supabase
		.from("events")
		.select(
			"*, venue:venues(*), event_artists!inner(id, artist_id, played_date, rating, artist:artists(*))",
		)
		.eq("event_artists.artist_id", artistId)
		.order("start_date", { ascending: false });
	if (error) throw error;
	return data as unknown as ConcertEvent[];
}

export async function getEventsForVenue(
	venueId: string,
): Promise<ConcertEvent[]> {
	const { data, error } = await supabase
		.from("events")
		.select(EVENT_SELECT)
		.eq("venue_id", venueId)
		.order("start_date", { ascending: false });
	if (error) throw error;
	return data as unknown as ConcertEvent[];
}

export async function createEvent(values: EventFormValues): Promise<string> {
	const userId = await currentUserId();
	const venueId = await findOrCreateVenue(
		userId,
		values.venueName,
		values.venueCity,
		values.venueCountry,
	);

	const { data: event, error } = await supabase
		.from("events")
		.insert({
			user_id: userId,
			name: values.name,
			venue_id: venueId,
			start_date: values.startDate,
			end_date: values.endDate || values.startDate,
			notes: values.notes || null,
		})
		.select("id")
		.single();
	if (error) throw error;

	await replaceEventArtists(userId, event.id, values.artists);
	return event.id;
}

export async function updateEvent(
	id: string,
	values: EventFormValues,
): Promise<void> {
	const userId = await currentUserId();
	const venueId = await findOrCreateVenue(
		userId,
		values.venueName,
		values.venueCity,
		values.venueCountry,
	);

	const { error } = await supabase
		.from("events")
		.update({
			name: values.name,
			venue_id: venueId,
			start_date: values.startDate,
			end_date: values.endDate || values.startDate,
			notes: values.notes || null,
		})
		.eq("id", id);
	if (error) throw error;

	await replaceEventArtists(userId, id, values.artists);
}

async function replaceEventArtists(
	userId: string,
	eventId: string,
	artists: { name: string; playedDate: string; rating: number | null }[],
): Promise<void> {
	const { error: deleteError } = await supabase
		.from("event_artists")
		.delete()
		.eq("event_id", eventId);
	if (deleteError) throw deleteError;

	for (const artist of artists) {
		const artistId = await findOrCreateArtist(userId, artist.name);
		const { error } = await supabase.from("event_artists").insert({
			event_id: eventId,
			artist_id: artistId,
			played_date: artist.playedDate,
			rating: artist.rating ?? null,
		});
		if (error) throw error;
	}
}

export async function deleteEvent(id: string): Promise<void> {
	const { error } = await supabase.from("events").delete().eq("id", id);
	if (error) throw error;
}

export async function getStats(): Promise<Stats> {
	const today = todayISO();
	let query = supabase.from("events").select(EVENT_SELECT);
	query = query.lt("end_date", today);
	const { data, error } = await query;
	if (error) throw error;
	return computeStats(data as unknown as ConcertEvent[]);
}

function computeStats(events: ConcertEvent[]): Stats {
	const artistCounts = new Map<
		string,
		{ name: string; count: number; ratings: number[] }
	>();
	const yearCounts = new Map<number, number>();
	const countries = new Set<string>();

	for (const event of events) {
		const year = new Date(event.start_date).getFullYear();
		yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1);
		countries.add(event.venue.country);

		for (const eventArtist of event.event_artists) {
			const existing = artistCounts.get(eventArtist.artist_id);
			const ratings = existing?.ratings ?? [];
			if (eventArtist.rating != null) ratings.push(eventArtist.rating);
			artistCounts.set(eventArtist.artist_id, {
				name: eventArtist.artist.name,
				count: (existing?.count ?? 0) + 1,
				ratings,
			});
		}
	}

	const artistStats: ArtistStat[] = Array.from(artistCounts.entries()).map(
		([artistId, { name, count, ratings }]) => {
			const { average, count: ratedCount } = averageRating(ratings);
			return {
				artistId,
				artistName: name,
				timesSeen: count,
				averageRating: average,
				ratedCount,
			};
		},
	);

	const topArtists = [...artistStats].sort(
		(a, b) =>
			b.timesSeen - a.timesSeen || a.artistName.localeCompare(b.artistName),
	);

	const topRatedArtists = artistStats
		.filter((a) => a.averageRating != null)
		.sort(
			(a, b) =>
				(b.averageRating ?? 0) - (a.averageRating ?? 0) ||
				b.ratedCount - a.ratedCount ||
				a.artistName.localeCompare(b.artistName),
		);

	const concertsByYear = Array.from(yearCounts.entries())
		.map(([year, concertCount]) => ({ year, concertCount }))
		.sort((a, b) => a.year - b.year);

	const busiestYear = concertsByYear.reduce<Stats["busiestYear"]>(
		(max, current) => {
			if (!max || current.concertCount > max.concertCount) return current;
			return max;
		},
		null,
	);

	return {
		topArtists,
		topRatedArtists,
		uniqueArtistCount: artistCounts.size,
		concertsByYear,
		busiestYear,
		countries: Array.from(countries).sort(),
		totalEvents: events.length,
	};
}
