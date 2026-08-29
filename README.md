# Concert Tracker

A personal app for logging concerts and festivals: which bands you saw, when, where, and stats like your most-seen artists and busiest year. Runs on web, iOS, and Android from one codebase.

## Stack

- **Client**: [Expo](https://expo.dev) + [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing) + TypeScript + React Native, targeting web, iOS, and Android from the same code.
- **Backend**: [Supabase](https://supabase.com) — hosted Postgres, auth, and a client SDK. No custom server; the app talks to Supabase directly.
- **Data model**: `venues` → `events` → `event_artists` → `artists`. An event (concert or festival) belongs to one venue and has many `event_artists` rows, each pairing an artist with the specific date they played (so multi-day festivals work naturally). Single-day shows are the common case, so the event form hides the end-date and per-artist played-date fields behind a "Multi-day concert" checkbox and defaults every date to the start date when it's unchecked. Every table is scoped to the logged-in user via Row Level Security.

## Setup

1. Create a free Supabase project, then run `supabase/schema.sql` in its SQL editor to create the tables and RLS policies.
2. Add a user to your Supabase project under 'Authentication'.
3. Copy `.env.example` to `.env` and fill in your project's values (see the Supabase dashboard's "Connect" dialog — Framework tab for the URL/publishable key, Server tab for the secret key, secret key is only necessary for import).
4. `npm install`
5. `npm run web` (browser) or `npm start` (Expo Go on your phone). Sign in with your user from step 2.

## Project structure

```
src/
  app/                  Expo Router screens (file-based: file path = route)
    _layout.tsx          Root layout — wraps the app in AuthProvider and guards
                          routes: signed out → login, signed in → (tabs)/event screens
    login.tsx            Email/password sign in & sign up
    (tabs)/               Bottom tab navigator
      _layout.tsx          Tab definitions (Concerts, Stats, Library)
      index.tsx            Concerts list — toggle between Upcoming and Seen,
                            with a collapsible filter panel (year/month/
                            country/city)
      stats.tsx             Most-seen artists, unique artist count, a
                            horizontally scrollable concerts-per-year bar
                            chart, busiest year, countries visited
      library.tsx           Browse/edit/delete existing artists and venues
                            (toggle between the two); rows link to the
                            artist/venue detail screens
    event/
      new.tsx              Create a concert
      [id].tsx             Edit or delete an existing concert
    artist/
      [id].tsx             Artist detail — inline rename/delete plus every
                          concert you've seen them at
    venue/
      [id].tsx             Venue detail — same pattern as artist/[id]

  components/           Reusable UI, one component per file
    button.tsx             Shared pressable button — primary/secondary/
                          destructive variants, optional icon, loading state
    event-form.tsx        The shared create/edit form used by event/new and
                          event/[id] — name, dates, venue, artist lineup,
                          delete. A "Multi-day concert" checkbox reveals the
                          end-date and per-artist played-date fields; when off,
                          all dates default to the start date.
    venue-picker.tsx       Search existing venues / create a new one (used in
                          event-form) — collapses to a summary once picked
    artist-picker.tsx      Same pattern as venue-picker, for artists
    artist-row.tsx         A row in the Library screen's artist list, with
                          inline edit/delete
    venue-row.tsx          Same, for venues
    concert-filters.tsx    Collapsible year/month/country/city filter panel
                          for the Concerts list, plus the matcher it uses
    search-bar.tsx         Reusable search input used by the picker/list screens
    header-back-button.tsx Navigation header back button with a fallback route
                          when there's no history to pop
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
    use-color-scheme.ts     Re-exports RN's useColorScheme (with a .web variant
                          that waits for hydration before reporting a scheme)

  constants/theme.ts      Colors, spacing scale, fonts used throughout

supabase/schema.sql     Database schema + Row Level Security policies — run
                        this once in the Supabase SQL editor
import/
  import-csv.ts        One-time importer for historical data from a CSV —
                        see the comment at the top of the file for the
                        expected column format and how to run it
  import-example.csv   Example csv for import
```

## How data flows

Screens call functions from `lib/api.ts`, never Supabase directly. `api.ts` handles "find or create" for venues and artists (so typing a venue/artist name that already exists reuses the same row instead of creating a duplicate), and computes the stats screen's numbers client-side from all your events (fine at personal-library scale).

## Importing historical data

If you're migrating from a spreadsheet, reshape it to one row per artist-performance (columns documented at the top of `import/import-csv.ts`), set `SUPABASE_SERVICE_ROLE_KEY` in `.env`, then:

```bash
npm run import-csv -- path/to/your-file.csv
```
