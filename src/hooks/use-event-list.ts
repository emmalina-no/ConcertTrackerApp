import { useCallback, useRef, useState } from 'react';

import { useFocusEffect } from 'expo-router';

import { getEvents } from '@/lib/api';
import type { ConcertEvent } from '@/lib/types';

type Filter = 'past' | 'upcoming';

export function useEventList(filter: Filter) {
  const [events, setEvents] = useState<ConcertEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Which filter `events` currently holds data for — null until the first load.
  // Kept as a ref for the synchronous loading decision and mirrored to state so
  // consumers can tell whether `events` matches the filter they asked for.
  const loadedFilterRef = useRef<Filter | null>(null);
  const [loadedFilter, setLoadedFilter] = useState<Filter | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      // Keep showing existing data while refetching on refocus; only show the
      // spinner until the current filter has loaded at least once.
      setLoading(loadedFilterRef.current !== filter);
      getEvents(filter)
        .then((data) => {
          if (!cancelled) {
            setEvents(data);
            loadedFilterRef.current = filter;
            setLoadedFilter(filter);
          }
        })
        .catch((err) => {
          if (!cancelled) setError(err.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [filter])
  );

  return { events, loading, error, loadedFilter };
}
