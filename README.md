# Concert Tracker

A personal app for logging concerts and festivals: which bands you saw, when, where, and stats like your most-seen artists and busiest year. Runs on web, iOS, and Android from one codebase.

## Stack

- **Client**: [Expo](https://expo.dev) + [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing) + TypeScript + React Native, targeting web, iOS, and Android from the same code.
- **Backend**: [Supabase](https://supabase.com) — hosted Postgres, auth, and a client SDK. No custom server; the app talks to Supabase directly.
- **Data model**: `venues` → `events` → `event_artists` → `artists`. An event (concert or festival) belongs to one venue and has many `event_artists` rows, each pairing an artist with the specific date they played (so multi-day festivals work naturally). Every table is scoped to the logged-in user via Row Level Security.

## Setup

1. Create a free Supabase project, then run `supabase/schema.sql` in its SQL editor to create the tables and RLS policies.
2. Copy `.env.example` to `.env` and fill in your project's values (see the Supabase dashboard's "Connect" dialog — Framework tab for the URL/publishable key, Server tab for the secret key).
3. `npm install`
4. `npm run web` (browser) or `npm start` (Expo Go on your phone). Sign up once from the login screen — first time creates your account.

## Project structure

```
src/
  app/                  Expo Router screens (file-based: file path = route)
    _layout.tsx          Root layout — wraps the app in AuthProvider and guards
                          routes: signed out → login, signed in → (tabs)/event screens
    login.tsx            Email/password sign in & sign up
    (tabs)/               Bottom tab navigator
      _layout.tsx          Tab definitions (Concerts, Stats, Library)
      index.tsx            Concerts list — toggle between Upcoming and Seen
      stats.tsx             Most-seen artists, unique artist count, concerts per
                            year, busiest year, countries visited
      library.tsx           Browse/edit/delete existing artists and venues
                            (toggle between the two)
    event/
      new.tsx              Create a concert
      [id].tsx             Edit or delete an existing concert

  components/           Reusable UI, one component per file
    event-form.tsx        The shared create/edit form used by event/new and
                          event/[id] — name, dates, venue, artist lineup, delete
    venue-picker.tsx       Search existing venues / create a new one (used in
                          event-form) — collapses to a summary once picked
    artist-picker.tsx      Same pattern as venue-picker, for artists
    artist-row.tsx         A row in the Library screen's artist list, with
                          inline edit/delete
    venue-row.tsx          Same, for venues
    date-field.tsx          Native date picker (iOS/Android)
    date-field.web.tsx      Web override — plain `<input type="date">`, since
                          the native picker library has no web build. Metro
                          picks whichever file matches the target platform.
    event-list-item.tsx    A single concert card in the Concerts list
    themed-*.tsx            Theme-aware Text/View/TextInput wrappers — use
                          these instead of raw RN components so light/dark
                          mode always has correct contrast

  lib/                  Non-UI logic
    supabase.ts            Supabase client setup (reads env vars)
    api.ts                 All database queries/mutations live here — screens
                          never call supabase.from(...) directly
    auth-context.tsx       React context exposing the current session
    confirm.ts             Cross-platform confirm() dialog (browser confirm()
                          on web, native Alert elsewhere) — used before deletes
    types.ts               Shared TypeScript types for the data model

  hooks/
    use-event-list.ts      Fetches past/upcoming events, refetches on screen
                          focus (so edits elsewhere show up when you come back)
    use-theme.ts            Resolves the current light/dark color palette

  constants/theme.ts      Colors, spacing scale, fonts used throughout

supabase/schema.sql     Database schema + Row Level Security policies — run
                        this once in the Supabase SQL editor
scripts/import-csv.ts   One-time importer for historical data from a CSV —
                        see the comment at the top of the file for the
                        expected column format and how to run it
```

## How data flows

Screens call functions from `lib/api.ts`, never Supabase directly. `api.ts` handles "find or create" for venues and artists (so typing a venue/artist name that already exists reuses the same row instead of creating a duplicate), and computes the stats screen's numbers client-side from all your events (fine at personal-library scale).

## Importing historical data

If you're migrating from a spreadsheet, reshape it to one row per artist-performance (columns documented at the top of `scripts/import-csv.ts`), set `SUPABASE_SERVICE_ROLE_KEY` in `.env`, then:

```bash
npm run import-csv -- path/to/your-file.csv
```
