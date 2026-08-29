-- Concert tracker schema
-- Run this in the Supabase SQL editor (or via `supabase db push` if using the CLI).

create table if not exists venues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  city text not null,
  country text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name, city)
);

create table if not exists artists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  venue_id uuid not null references venues (id) on delete restrict,
  start_date date not null,
  end_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, name, start_date)
);

create table if not exists event_artists (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  artist_id uuid not null references artists (id) on delete restrict,
  played_date date not null,
  rating smallint check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  unique (event_id, artist_id, played_date)
);

-- Migration for existing databases: run this once in the Supabase SQL editor.
alter table event_artists
  add column if not exists rating smallint check (rating between 1 and 5);

create index if not exists events_start_date_idx on events (start_date);
create index if not exists event_artists_event_id_idx on event_artists (event_id);
create index if not exists event_artists_artist_id_idx on event_artists (artist_id);

-- Row Level Security: every row is scoped to the owning user.
alter table venues enable row level security;
alter table artists enable row level security;
alter table events enable row level security;
alter table event_artists enable row level security;

create policy "venues: owner full access" on venues
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "artists: owner full access" on artists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "events: owner full access" on events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- event_artists has no user_id column directly; scope through the parent event.
create policy "event_artists: owner full access" on event_artists
  for all using (
    exists (select 1 from events e where e.id = event_artists.event_id and e.user_id = auth.uid())
  ) with check (
    exists (select 1 from events e where e.id = event_artists.event_id and e.user_id = auth.uid())
  );
