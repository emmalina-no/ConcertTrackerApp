import { router } from 'expo-router';

import { EventForm } from '@/components/feature/event-form';
import { createEvent } from '@/lib/api';
import type { EventFormValues } from '@/lib/types';

export default function NewEventScreen() {
  async function handleSubmit(values: EventFormValues) {
    await createEvent(values);
    router.back();
  }

  return <EventForm submitLabel="Save concert" onSubmit={handleSubmit} />;
}
