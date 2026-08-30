import { useCallback, useEffect, useMemo, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  EMPTY_FILTERS,
  type ConcertFilters,
} from "@/components/feature/concert-filters";

type View = "past" | "upcoming";

const STORAGE_KEY = "concertFilters.byView.v2";

type StoredFilters = Partial<Record<View, ConcertFilters>>;

/** Coerce whatever came out of storage into a valid ConcertFilters. */
function normalize(value: unknown): ConcertFilters {
  const v = (value ?? {}) as Partial<Record<keyof ConcertFilters, unknown>>;
  const arr = <T>(x: unknown, guard: (e: unknown) => e is T): T[] =>
    Array.isArray(x) ? x.filter(guard) : [];
  const isNum = (e: unknown): e is number => typeof e === "number";
  const isStr = (e: unknown): e is string => typeof e === "string";
  return {
    years: arr(v.years, isNum),
    months: arr(v.months, isNum),
    countries: arr(v.countries, isStr),
    cities: arr(v.cities, isStr),
  };
}

/**
 * Per-view concert filters, persisted to storage. Each view (past / upcoming)
 * keeps its own filter set, so switching views doesn't carry filters across but
 * returning to a view restores what was set there — across app restarts too.
 */
export function useConcertFilters(view: View) {
  const [byView, setByView] = useState<StoredFilters>({});

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw && !cancelled) setByView(JSON.parse(raw));
      })
      .catch(() => {
        // Ignore unreadable/corrupt storage — fall back to empty filters.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stored = byView[view];
  const filters = useMemo<ConcertFilters>(
    () => (stored ? normalize(stored) : EMPTY_FILTERS),
    [stored],
  );

  const setFilters = useCallback(
    (next: ConcertFilters) => {
      setByView((prev) => {
        const updated = { ...prev, [view]: next };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {
          // Best-effort persistence; in-memory state still updates.
        });
        return updated;
      });
    },
    [view],
  );

  return { filters, setFilters };
}
