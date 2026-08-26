import { EventListScreen } from '@/components/event-list-screen';

export default function UpcomingConcertsScreen() {
  return <EventListScreen filter="upcoming" emptyText="No upcoming concerts yet." />;
}
