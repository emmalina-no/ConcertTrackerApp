import { useCallback, useState } from 'react';

import { useFocusEffect } from 'expo-router';

import { getEvents } from '@/lib/api';
import type { ConcertEvent } from '@/lib/types';

export function useEventList(filter: 'past' | 'upcoming') {
  const [events, setEvents] = useState<ConcertEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      getEvents(filter)
        .then((data) => {
          if (!cancelled) setEvents(data);
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

  return { events, loading, error };
}
