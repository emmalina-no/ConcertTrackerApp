// One-time import of a historical concert CSV into Supabase.
//
// Usage:
//   npx tsx scripts/import-csv.ts path/to/concerts.csv
//
// Required env vars (put them in .env, not committed):
//   EXPO_PUBLIC_SUPABASE_URL       - same as the app uses
//   SUPABASE_SERVICE_ROLE_KEY      - service role key (Project Settings > API), NOT the anon key
//
// Expected CSV columns (one row per artist-performance):
//   event_name, event_start_date, event_end_date, venue_name, venue_city, venue_country,
//   artist_name, played_date, notes
import "dotenv/config";

import { readFileSync } from "node:fs";

import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";

type Row = {
  event_name: string;
  event_start_date: string;
  event_end_date: string;
  venue_name: string;
  venue_city: string;
  venue_country: string;
  artist_name: string;
  played_date: string;
  notes: string;
};

function requireId(
  data: { id: string } | null,
  error: { message: string } | null,
): string {
  if (error) throw error;
  if (!data) throw new Error("Insert/upsert returned no row");
  return data.id;
}

// Converts "DD.MM.YYYY" to "YYYY-MM-DD" for Postgres date columns. Passes through
// anything already in YYYY-MM-DD form (or empty), since some rows/columns are optional.
function toIsoDate(value: string): string {
  if (!value) return value;
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return value;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: npx tsx scripts/import-csv.ts path/to/concerts.csv");
    process.exit(1);
  }

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.",
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: users, error: usersError } =
    await supabase.auth.admin.listUsers();
  if (usersError) throw usersError;
  if (users.users.length !== 1) {
    console.error(
      `Expected exactly one user in this Supabase project (found ${users.users.length}). ` +
        "Set IMPORT_USER_ID explicitly if you have more than one account.",
    );
    process.exit(1);
  }
  const userId = process.env.IMPORT_USER_ID ?? users.users[0].id;

  const rows = parse(readFileSync(csvPath, "utf-8"), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    delimiter: ";",
  }) as Row[];

  console.log(`Parsed ${rows.length} rows from ${csvPath}`);

  const venueIdByKey = new Map<string, string>();
  const artistIdByName = new Map<string, string>();
  const eventIdByKey = new Map<string, string>();
  let inserted = 0;

  for (const row of rows) {
    const venueKey = `${row.venue_name}|${row.venue_city}`;
    let venueId = venueIdByKey.get(venueKey);
    if (!venueId) {
      const { data, error } = await supabase
        .from("venues")
        .upsert(
          {
            user_id: userId,
            name: row.venue_name,
            city: row.venue_city,
            country: row.venue_country,
          },
          { onConflict: "user_id,name,city" },
        )
        .select("id")
        .single();
      venueId = requireId(data, error);
      venueIdByKey.set(venueKey, venueId);
    }

    let artistId = artistIdByName.get(row.artist_name);
    if (!artistId) {
      const { data, error } = await supabase
        .from("artists")
        .upsert(
          { user_id: userId, name: row.artist_name },
          { onConflict: "user_id,name" },
        )
        .select("id")
        .single();
      artistId = requireId(data, error);
      artistIdByName.set(row.artist_name, artistId);
    }

    const startDate = toIsoDate(row.event_start_date);
    const endDate = toIsoDate(row.event_end_date) || startDate;
    const playedDate = toIsoDate(row.played_date) || startDate;

    const eventKey = `${row.event_name}|${startDate}`;
    let eventId = eventIdByKey.get(eventKey);
    if (!eventId) {
      const { data, error } = await supabase
        .from("events")
        .upsert(
          {
            user_id: userId,
            name: row.event_name,
            venue_id: venueId,
            start_date: startDate,
            end_date: endDate,
            notes: row.notes || null,
          },
          { onConflict: "user_id,name,start_date" },
        )
        .select("id")
        .single();
      eventId = requireId(data, error);
      eventIdByKey.set(eventKey, eventId);
    }

    const { error } = await supabase.from("event_artists").upsert(
      { event_id: eventId, artist_id: artistId, played_date: playedDate },
      {
        onConflict: "event_id,artist_id,played_date",
        ignoreDuplicates: true,
      },
    );
    if (error) throw error;
    inserted += 1;
  }

  console.log(
    `Done. Upserted ${venueIdByKey.size} venues, ${artistIdByName.size} artists, ${eventIdByKey.size} events, ${inserted} artist-performances.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
