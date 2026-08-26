import { EventListScreen } from '@/components/event-list-screen';

export default function PastConcertsScreen() {
  return <EventListScreen filter="past" emptyText="No past concerts logged yet." />;
}
